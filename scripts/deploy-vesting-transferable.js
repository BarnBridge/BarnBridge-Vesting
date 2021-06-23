const { ethers } = require('@nomiclabs/buidler')

async function main () {
    const VestingTransferable = await ethers.getContractFactory('VestingTransferable')

    const bondTokenAddress = '0x0391D2021f89DC339F60Fff84546EA23E337750f'
    const startTime = 1622419200

    const owner = '0xc192F75bcb64D2E4f7e444A8E6fe8c3729728086'
    const claimant = '0x71bB1e70B126a03DcEE7B88733E900f6fC20a469'
    const totalBalance = ethers.BigNumber.from(1270).mul(ethers.BigNumber.from(10).pow(18))

    const vestingTransferable = await VestingTransferable.deploy(claimant, owner, bondTokenAddress, startTime, totalBalance)
    await vestingTransferable.deployed()

    console.log(`VestingTransferable.sol Deployed at ${vestingTransferable.address}`)
    console.log(` - with params: ${claimant} ${owner} ${bondTokenAddress} ${startTime} ${totalBalance.toString()}`)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
