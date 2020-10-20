const { ethers } = require('@nomiclabs/buidler')

async function main () {
    const Vesting = await ethers.getContractFactory('Vesting')
    const VestingRouter = await ethers.getContractFactory('VestingRouter')

    const bondTokenAddress = '0x0391D2021f89DC339F60Fff84546EA23E337750f'
    const startTime = 1603065600

    const owners = {
        fourRC: {
            address: '0xfc775166c7ba5DFDA475FAAB4f03D8006adBe763',
            amount: 225000,
        },
        parafi: {
            address: '0x8Db0401F6De4adDBE50EDe7b1460852ae837dBDd',
            amount: 187500,
        },
        kain: {
            address: '0x3d4AD2333629eE478E4f522d60A56Ae1Db5D3Cdb',
            amount: 75000,
        },
        centrality: {
            address: '0x660C1750CEa5893a20F762b1E32353c1c825Ff1F',
            amount: 75000,
        },
        proofSystems: {
            address: '0xFdc45E8A348Afbf8F59d9611BF6Cc634B99E2aE4',
            amount: 37500,
        },
        kinHodl: {
            address: '0x52EebD82826a7B530839424cEAb6CA3643eB0Ef1',
            amount: 37500,
        },
        aaron: {
            address: '0x3483573534982883edef09dedd57c0c90825fbee',
            amount: 37500,
        },
        blockchainCompanies: {
            address: '0x51c60c3cd234430A238f33559D8d4aA646741820',
            amount: 18750,
        },
        andrew: {
            address: '0x5d76A92b7cB9E1A81B8eb8c16468F1155B2f64f4',
            amount: 18750,
        },
        dahret: {
            address: '0x569ad69df4aD0ca6E466dd670A72475De94309D3',
            amount: 18750,
        },
        stani: {
            address: '0xF5Fb27b912D987B5b6e02A1B1BE0C1F0740E2c6f',
            amount: 18750,
        },
        dmob: {
            address: '0x01772953ed3B69349088aE7824c649d6dcd0cB1E',
            amount: 650000,
        },
        tyler: {
            address: '0x747dfb7D6D27671B4e3E98087f00e6B023d0AAb7',
            amount: 300000,
        },
        rudeLabs: {
            address: '0x61C47FaC14afBe2e03DdbFef3695026328E83a83',
            amount: 300000,
        },
        aaronAdvisor: {
            address: '0x3483573534982883edef09dedd57c0c90825fbee',
            amount: 100000,
        },
        atpar: {
            address: '0xb1dC62436Bc918FAfbF84E413028FB6CA185aDBa',
            amount: 100000,
        },
    }

    let currentVesting
    const vestingArray = []
    const amountArray = []
    const amountArrayString = []
    let counter = 1
    let amount
    for (const key in owners) {
        amount = ethers.BigNumber.from(owners[key].amount)
            .mul(ethers.BigNumber.from(10).pow(18))

        currentVesting = await Vesting.deploy(owners[key].address, bondTokenAddress, startTime, amount)
        await currentVesting.deployed()

        vestingArray.push(currentVesting.address)
        amountArray.push(ethers.BigNumber.from(amount))
        amountArrayString.push(amount.toString())

        console.log(`Vesting #${counter} deployed at address ${currentVesting.address} with amount: ${amount.toString()}`)

        counter++
    }

    console.log(vestingArray)
    console.log(amountArrayString)

    const vestingRouter = await VestingRouter.deploy(vestingArray, amountArray, bondTokenAddress)
    await vestingRouter.deployed()

    console.log(`Vesting Router deployed at address ${vestingRouter.address} with BOND ${bondTokenAddress}`)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
