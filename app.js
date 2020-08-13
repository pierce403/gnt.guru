let provider;
let accounts;

let gntAddress =  "0xa74476443119A942dE498590Fe1f2454d7D4aC0d";
let gntwAddress = "0x936f78b9852d12f5cb93177c1f84fb8513d06263";
let depositAddress;

let gntBalance;
let gntwBalance;

let accountAddress = "";
let signer;
let myRegTime = 0;

let gntAbi = [
    "function balanceOf(address) public view returns(uint256)",
    "function transfer(address to, uint256 amount) returns (bool success)"
];

let gntwAbi = [
    "function balanceOf(address) public view returns(uint256)",
    "function createPersonalDepositAddress() public returns(address)",
    "function getPersonalDepositAddress(address) public view returns (address)",
    "function processDeposit() public returns(null)",
    "function transfer(address to, uint256 amount) returns (bool success)"
];

document.getElementById("msg").textContent = 'Web3 Browser Required (Metamask etc)';

ethereum.enable().then(function () {

    provider = new ethers.providers.Web3Provider(web3.currentProvider);


    provider.getNetwork().then(function (result) {
        if (result['chainId'] != 1) {
            document.getElementById("msg").textContent = 'Switch to Mainnet!';

        } else { // okay, confirmed we're on mainnet

            provider.listAccounts().then(function (result) {
                console.log(result);
                accountAddress = result[0]; // figure out the user's Eth address

                provider.getBalance(String(result[0])).then(function (balance) {
                    var myBalance = (balance / ethers.constants.WeiPerEther).toFixed(4);
                    console.log("Your Balance: " + myBalance);
                    document.getElementById("msg").textContent = "Web3 Wallet Connected";
                    document.getElementById("ethTotal").textContent = myBalance;
                });

                // get a signer object so we can do things that need signing
                signer = provider.getSigner();

                gntContract  = new ethers.Contract(gntAddress, gntAbi, signer);
                gntwContract = new ethers.Contract(gntwAddress, gntwAbi, signer);
                
                gntContract.balanceOf(accountAddress).then(function (value) {
                    gntBalance = (value / ethers.constants.WeiPerEther).toFixed(4);
                    document.getElementById("gntTotal").textContent = gntBalance;
                    if(gntBalance>0)
                    {
                      document.getElementById("haveGNT").textContent = "*yup*";
                    }
                    else{
                      document.getElementById("haveGNT").textContent = "*nope*";
                    }
                })
                                
                gntwContract.balanceOf(accountAddress).then(function (value) {
                    gntwBalance = (value / ethers.constants.WeiPerEther).toFixed(4);
                    document.getElementById("gntwTotal").textContent = gntwBalance;
                    if(gntwBalance>0)
                    {
                      document.getElementById("haveGNTW").textContent = "*yup*";
                      document.getElementById("unwrapButton").disabled=false;
                      document.getElementById("msg").innerHTML = "READY FOR <a href='https://app.uniswap.org/#/swap?outputCurrency=0x936f78b9852d12f5cb93177c1f84fb8513d06263'>UNISWAP</a>";
                    }
                    else{
                      document.getElementById("haveGNTW").textContent = "*nope*";
                    }
                })

                gntwContract.getPersonalDepositAddress(accountAddress).then(function (value) {
                    depositAddress = value;
                    if(value==="0x0000000000000000000000000000000000000000")
                    {
                        // looks like we don't have a deposit address yet
                        document.getElementById("haveDepositAddress").textContent="*nope* "
                        document.getElementById("createButton").hidden=false;
                        document.getElementById("haveDeposit").textContent = "*nope*";
                    }
                    else{
                        // tell the user what their deposit address is
                        document.getElementById("haveDepositAddress").textContent = depositAddress;

                        gntContract.balanceOf(depositAddress).then(function (value) {
                            let depositBalance = (value / ethers.constants.WeiPerEther).toFixed(4);
                            if(depositBalance>0){
                              document.getElementById("haveDeposit").textContent = depositBalance+" GNT";
                              document.getElementById("claimButton").disabled=false;
                            }
                            else{
                              document.getElementById("haveDeposit").textContent = "*nope*";
                              document.getElementById("depositButton").disabled=false;
                            }
                        })
                    }
                })
            })
        }
    })
})

function deposit()
{
    let depositAmount = parseInt(document.getElementById("depositAmount").value);
    console.log("depositing "+depositAmount);
    if(isNaN(depositAmount)){
        console.log("bad value for deposit");
        document.getElementById("msg").textContent="ERROR: bad value for deposit";
        return;
    }
    if(depositAmount>gntBalance)
    {
        console.log("you don't have that much");
        document.getElementById("msg").textContent="ERROR: you don't have that much";
        return;
    }
    console.log("sending GNT to deposit address");

    // send over the GNT to the deposit address
    gntContract.transfer(depositAddress,String(ethers.constants.WeiPerEther*depositAmount)).then(function (value) {
    //gntContract.transfer(depositAddress,"3000000000000000000").then(function (value) {
        console.log("deposit complete "+value);
    })
}

function create()
{
    // create the deposit address
    gntwContract.createPersonalDepositAddress().then(function (value){
        console.log("deposit address created "+value);
    }) 
}

function claim()
{
    // send over the GNT to the deposit address
    gntwContract.processDeposit().then(function (value){
        console.log("claim complete "+value);
    })    
}

function unwrap()
{
    let unwrapAmount = parseInt(document.getElementById("unwrapAmount").value);
    console.log("withdrawing "+unwrapAmount);
    if(isNaN(unwrapAmount)){
        console.log("bad value for unwrap");
        document.getElementById("msg").textContent="ERROR: bad value for unwrap";
        return;
    }
    console.log("unwraping GNTW");

    // unwrap GNTW
    gntwContract.transfer(gntwAddress,String(ethers.constants.WeiPerEther*unwrapAmount)).then(function (value) {
        console.log("unwrap complete "+value);
    })    
}