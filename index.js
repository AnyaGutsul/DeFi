let cEthAbi = ""
let cEthInstance = ""
const addr = "0x859e9d8a4edadfEDb5A2fF311243af80F85A91b8" //cETH coin address
var account = ""
web3 = new Web3(web3.currentProvider)
let metaBalance = ""
let balance = ""
let uBalance = ""
let connected = false

const start = async () => {
    //connect to metamask
    const ethEnabled = async () => {
        if (window.ethereum) {
            //await window.ethereum.send('eth_requestAccounts');
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            window.web3 = new Web3(window.ethereum);
            return true;
        }
        return false;
    }
    connected = await ethEnabled()

    //load the cETH contract
    let resp = await fetch("cETH.json")
    cEthAbi = await resp.json()
    //console.log(cEthAbi)
    cEthInstance = new web3.eth.Contract(cEthAbi, addr)

    //get the metamask account
    if (connected) {
        var accounts = await ethereum.request({ method: 'eth_accounts' });
        account = accounts[0]
        console.log(accounts[0])
    }
    updateBalances()
}

const getMetaBalance = async () => {
    metaBalance = await web3.eth.getBalance(account)
    metaBalance = web3.utils.fromWei(metaBalance)
    //console.log("Meta balance " + metaBalance)
    document.getElementById("max_mint").innerHTML = "MAX " + metaBalance;
    document.getElementById("meta_balance").innerHTML = metaBalance;
}
const getBalance = async () => {
    balance = await cEthInstance.methods.balanceOf(account).call() / 1e8
    //console.log("balance " + balance)
    document.getElementById("balance").innerHTML = balance;
    document.getElementById("max_redeem").innerHTML = "MAX " + balance;
    document.getElementById("max_transfer").innerHTML = "MAX " + balance;
}

const getUnderlyingBalance = async () => {
    uBalance = await cEthInstance.methods.balanceOfUnderlying(account).call()
    uBalance = Web3.utils.fromWei(uBalance);
    //console.log("balance of underlying " + uBalance)
    document.getElementById("u_balance").innerHTML = uBalance;
    document.getElementById("max_redeem_u").innerHTML = "MAX " + uBalance;
}

const marketUpdate = async () => {
    //market total supply 
    let totalSupply = await cEthInstance.methods.totalSupply().call() / 1e8
    //console.log("total supply = " + totalSupply)
    document.getElementById("total_supply").innerHTML = totalSupply;

    //current exchange rate from cETH to ETH
    let exRate = await cEthInstance.methods.exchangeRateCurrent().call()
    exRate = exRate / Math.pow(10, 18 + 18 - 8);
    //console.log(" exchange Rate = " + exRate)
    document.getElementById("ex_rate").innerHTML = exRate;
}

const updateBalances = async () => {
    getMetaBalance()
    getBalance()
    marketUpdate()
    getUnderlyingBalance()
}

const validation = (input) => {
    let pattern = /^-?[0-9.]+/
    if (input == '') return "Enter amount, please."
    else if (!pattern.test(input)) return "Invalid input, please try again."
    else return "Processing..."
}

const userMint = () => {
    var mint_amount = document.getElementById('mint_am').value
    console.log("mint amount => " + mint_amount)

    document.getElementById("mint_error").innerHTML = validation(mint_amount)

    if (mint_amount != '') {
        if (mint_amount <= metaBalance) {
            let supplyValue = web3.utils.toWei(mint_amount, "ether")
            cEthInstance.methods.mint().send({ from: account, value: supplyValue, gas: "200000" })
                .once("transactionHash", (hash) => {
                    // Transaction hash
                    console.log("mint transaction hash => " + hash)
                })
                .on("confirmation", (number, receipt) => {
                    // Number of confirmations
                })
                .on("error", (error) => {
                    console.log(error)
                });
            updateBalances()
            document.getElementById("mint_error").innerHTML = ""
            document.getElementById("mint_am").value = ""
        } else {
            document.getElementById("mint_error").innerHTML = "Supply amount is greater than your ETH balance."
        }
    }
}

const userRedeem = () => {
    var redeem_amount = document.getElementById('redeem_am').value;
    console.log("redeem amount => " + redeem_amount)

    document.getElementById("redeem_error").innerHTML = validation(redeem_amount)

    if (redeem_amount != '') {
        if (redeem_amount <= balance) {
            cEthInstance.methods.redeem(redeem_amount * 1e8).send({ from: account })
                .once("transactionHash", (hash) => {
                    // Transaction Hash
                    console.log("redeem transaction hash => " + hash)
                })
                .on("confirmation", (number, receipt) => {
                    // Number of confirmations
                })
                .on("error", (error) => {
                    console.log(error)
                });
            updateBalances()
            document.getElementById("redeem_error").innerHTML = ""
            document.getElementById("redeem_am").value = ""
        } else {
            document.getElementById("redeem_error").innerHTML = "Withdraw amount is greater than your cETH balance."
        }
    }
}

const userRedeemUnderlying = () => {
    var redeem_u_amount = document.getElementById('redeem_u_am').value;
    console.log("redeem underlying amount => " + redeem_u_amount)
    document.getElementById("redeem_u_error").innerHTML = validation(redeem_u_amount)

    if (redeem_u_amount != '') {
        if (redeem_u_amount <= uBalance) {
            let sp = web3.utils.toWei(redeem_u_amount, "ether")
            cEthInstance.methods.redeemUnderlying(sp).send({ from: account })
                .once("transactionHash", (hash) => {
                    // Transaction Hash
                    console.log("redeem underlying transaction hash => " + hash)
                })
                .on("confirmation", (number, receipt) => {
                    // Number of confirmations
                })
                .on("error", (error) => {
                    console.log(error)
                });
            updateBalances()
            document.getElementById("redeem_u_error").innerHTML = ""
            document.getElementById("redeem_u_am").value = ""
        } else {
            document.getElementById("redeem_u_error").innerHTML = "Withdraw amount is greater than your Compound ETH balance."
        }
    }
}

const userTransfer = () => {
    var to_address = document.getElementById('transfer_add').value;
    var transfer_amount = document.getElementById('transfer_am').value

    document.getElementById("transfer_error").innerHTML = validation(transfer_amount)

    if (transfer_amount != '' && to_address != '') {
        console.log("transfer amount => " + transfer_amount)

        if (transfer_amount <= balance) {
            cEthInstance.methods.transfer(to_address, transfer_amount * 1e8).send({ from: account })
                .once("transactionHash", (hash) => {
                    // Transaction hash
                    console.log("transfer transaction hash => " + hash)
                })
                .on("confirmation", (number, receipt) => {
                    // Number of confirmations
                })
                .on("error", (error) => {
                    console.log(error)
                });
            updateBalances()
            document.getElementById("transfer_error").innerHTML = ""
            document.getElementById("transfer_am").value = ""
            document.getElementById("transfer_add").value = ""
        } else {
            document.getElementById("transfer_error").innerHTML = "Transfer amount is greater than your cETH balance."
        }
    } else {
        document.getElementById("transfer_error").innerHTML = "Enter amount and address, please."
    }
}

start()
setInterval(updateBalances, 5000)