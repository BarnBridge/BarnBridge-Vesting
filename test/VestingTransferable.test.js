const { expect } = require('chai')
const { ethers } = require('@nomiclabs/buidler')

describe('VestingTransferable', function () {
    let owner, claimant, user, userAddr, claimantAddr
    let bondToken, vestingTransferable
    const distributedAmount = ethers.BigNumber.from(800000).mul(ethers.BigNumber.from(10).pow(18))
    let snapshotId

    const epochDuration = 604800
    const epoch1Start = getCurrentUnix() + 1000

    beforeEach(async function () {
        snapshotId = await ethers.provider.send('evm_snapshot')
        const [creator, ownerSigner, claimantSigner, userSigner] = await ethers.getSigners()
        owner = ownerSigner
        user = userSigner
        claimant = claimantSigner
        userAddr = await user.getAddress()
        claimantAddr = await claimant.getAddress()

        const VestingTransferable = await ethers.getContractFactory('VestingTransferable', creator)
        const ERC20Mock = await ethers.getContractFactory('ERC20Mock')

        bondToken = await ERC20Mock.deploy()
        vestingTransferable = await VestingTransferable.deploy(await claimant.getAddress(), userAddr, bondToken.address, epoch1Start, distributedAmount)
    })

    afterEach(async function () {
        await ethers.provider.send('evm_revert', [snapshotId])
    })

    describe('General Contract checks', function () {
        it('should be deployed', async function () {
            expect(vestingTransferable.address).to.not.equal(0)
            expect(bondToken.address).to.not.equal(0)
        })
        it('should have the owner set as userAddr', async function () {
            expect(await vestingTransferable.owner()).to.be.equal(userAddr)
        })
        it('should have the claimant set properly', async function () {
            expect(await vestingTransferable.claimant()).to.be.equal(await claimant.getAddress())
        })
        it('should have current epoch 0', async function () {
            expect(await vestingTransferable.getCurrentEpoch()).to.be.equal(0)
            await moveAtEpoch(-1)
            expect(await vestingTransferable.getCurrentEpoch()).to.be.equal(0)
        })
        it('should have last claimed epoch 0', async function () {
            expect(await vestingTransferable.lastClaimedEpoch()).to.be.equal(0)
        })
        it('should have bond balance 0', async function () {
            expect(await vestingTransferable.balance()).to.be.equal(0)
        })
        it('should have totalDistributedBalance 0', async function () {
            expect(await vestingTransferable.totalDistributedBalance()).to.be.equal(distributedAmount)
        })
        it('should have claim function callable by anyone', async function () {
            await expect(vestingTransferable.connect(user).claim()).to.not.be.revertedWith('Ownable: caller is not the owner')
        })
        it('should have changeClaimant not callable by anyone', async function () {
            await expect(vestingTransferable.connect(claimant).changeClaimant(userAddr)).to.be.revertedWith('Ownable: caller is not the owner')
        })
        it('should have changeClaimant callable by owner', async function () {
            await expect(vestingTransferable.connect(user).changeClaimant(userAddr)).to.not.be.revertedWith('Ownable: caller is not the owner')
            expect(await vestingTransferable.claimant()).to.be.equal(userAddr)
        })
        it('should have the epoch1', async function () {
            await moveAtEpoch(1)
            expect(await vestingTransferable.getCurrentEpoch()).to.be.equal(1)
        })
        it('should have the epoch 0', async function () {
            expect(await vestingTransferable.getCurrentEpoch()).to.be.equal(0)
        })
    })

    describe('Contract Tests', function () {
        it('should should deposit some tokens', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount)
            expect(await vestingTransferable.balance()).to.be.equal(distributedAmount)
        })
        it('should mint for 1 week', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount) // set tokens
            await moveAtEpoch(2)
            await vestingTransferable.connect(user).claim()
            expect(await bondToken.balanceOf(claimantAddr)).to.be.equal(distributedAmount.div(100))
            expect(await vestingTransferable.balance()).to.be.equal(distributedAmount.sub(distributedAmount.div(100)))
            expect(await vestingTransferable.lastClaimedEpoch()).to.be.equal(1)
        })
        it('should mint with default function', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount) // set tokens
            await moveAtEpoch(3)
            await user.sendTransaction({
                to: vestingTransferable.address,
            })
            expect(await bondToken.balanceOf(claimantAddr)).to.be.equal((distributedAmount.div(100)).mul(2))
            expect(await vestingTransferable.balance()).to.be.equal(distributedAmount.sub(distributedAmount.div(100).mul(2)))
            expect(await vestingTransferable.lastClaimedEpoch()).to.be.equal(2)
        })
        it('should mint with any user calling claim', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount) // set tokens
            await moveAtEpoch(3)
            await vestingTransferable.connect(owner).claim()
            expect(await bondToken.balanceOf(owner.getAddress())).to.be.equal(0)
            expect(await bondToken.balanceOf(claimantAddr)).to.be.equal((distributedAmount.div(100)).mul(2))
            expect(await vestingTransferable.balance()).to.be.equal(distributedAmount.sub(distributedAmount.div(100).mul(2)))
            expect(await vestingTransferable.lastClaimedEpoch()).to.be.equal(2)
        })
        it('should mint with any user sending 0 ETH', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount) // set tokens
            await moveAtEpoch(6)
            await owner.sendTransaction({
                to: vestingTransferable.address,
            })
            expect(await bondToken.balanceOf(owner.getAddress())).to.be.equal(0)
            expect(await bondToken.balanceOf(claimantAddr)).to.be.equal((distributedAmount.div(100)).mul(5))
            expect(await vestingTransferable.balance()).to.be.equal(distributedAmount.sub(distributedAmount.div(100).mul(5)))
            expect(await vestingTransferable.lastClaimedEpoch()).to.be.equal(5)
        })
        it('should mint for 100 week', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount.add(1)) // set tokens
            await moveAtEpoch(104)
            expect(await vestingTransferable.getCurrentEpoch()).to.be.equal(104)
            await vestingTransferable.connect(user).claim()
            expect(await bondToken.balanceOf(claimantAddr)).to.be.equal(distributedAmount.add(1))
            expect(await vestingTransferable.balance()).to.be.equal(0)
            expect(await vestingTransferable.lastClaimedEpoch()).to.be.equal(100)
        })
        it('should emit', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount) // set tokens
            await moveAtEpoch(59)
            expect(vestingTransferable.connect(user).claim()).to.emit(bondToken, 'Transfer')
        })
        it('should not emit', async function () {
            await bondToken.mint(vestingTransferable.address, distributedAmount) // set tokens
            await moveAtEpoch(60)
            await vestingTransferable.connect(user).claim()
            expect(vestingTransferable.connect(user).claim()).to.not.emit(bondToken, 'Transfer')
        })
    })

    function getCurrentUnix () {
        return Math.floor(Date.now() / 1000)
    }

    async function setNextBlockTimestamp (timestamp) {
        const block = await ethers.provider.send('eth_getBlockByNumber', ['latest', false])
        const currentTs = parseInt(block.timestamp)
        const diff = timestamp - currentTs
        await ethers.provider.send('evm_increaseTime', [diff])
    }

    async function moveAtEpoch (epoch) {
        await setNextBlockTimestamp(epoch1Start + epochDuration * (epoch - 1))
        await ethers.provider.send('evm_mine')
    }
})
