async function main() {
    // We get the contract to deploy

    const Vesting = await ethers.getContractFactory("Vesting");
    const VestingRouter = await ethers.getContractFactory("VestingRouter");

    const bondTokenAddress = '0x64496f51779e400C5E955228E56fA41563Fb4dd8';
    const starTime = Date.now();

    const owners = {
        owner1: {
            address: '0xab59cab2c04a759a47c25aea3d22921cc29885dd',
            amount: 15000000,
        },
        owner2: {
            address: '0x747dfb7d6d27671b4e3e98087f00e6b023d0aab7',
            amount: 15000000,
        },
        owner3: {
            address: '0x597880a850b323c6059d35fd4b59ce65c5e42e20',
            amount: 15000000,
        },
        owner4: {
            address: '0xfc775166c7ba5dfda475faab4f03d8006adbe763',
            amount: 14000000,
        },
        owner5: {
            address: '0x8db0401f6de4addbe50ede7b1460852ae837dbdd',
            amount: 11000000,
        },
        owner6: {
            address: '0x3483573534982883edef09dedd57c0c90825fbee',
            amount: 7000000,
        },
        owner7: {
            address: '0xb1dc62436bc918fafbf84e413028fb6ca185adba',
            amount: 5000000,
        },
        owner8: {
            address: '0x3d4ad2333629ee478e4f522d60a56ae1db5d3cdb',
            amount: 5000000,
        },
        owner9: {
            address: '0x3d4ad2333629ee478e4f522d60a56ae1db5d3cdb',
            amount: 5000000,
        }
    }
    let currentVesting;
    let vestingArray = [];
    let amountArray = [];
    let counter = 1;
    let amount;
    for (let key in owners) {
        amount = ethers.BigNumber.from(owners[key].amount).mul(ethers.BigNumber.from(10).pow(18))
        currentVesting = await Vesting.deploy(owners[key].address, bondTokenAddress, starTime, amount);
        vestingArray.push(currentVesting.address);
        amountArray.push(ethers.BigNumber.from(amount));
        console.log(`Vesting #${counter} deployed at address ${currentVesting.address} with amount: ${amount.toString()}`);
        counter++;
    }

    const vestingRouter = await VestingRouter.deploy(vestingArray, amountArray, bondTokenAddress);
    console.log(`Vesting Router deployed at address ${vestingRouter.address} with BOND ${bondTokenAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
