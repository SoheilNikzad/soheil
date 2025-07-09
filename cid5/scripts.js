//Dados Contrato

const web3 = new Web3(ethereum);
const contractGroupChatAddress = "0xe28b43712A03D697345De102a04782b8aDb8B2bc"
const contractGroupAddress = "0x3C404d523Bc4a8e5D0b82D09740cb9cf0fc67DAa"
const contractGroupABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_enderecoGroupChatImplementation",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "groupExists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "groupId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "idToGroupChat",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "groupName",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "idToMessagesSentBy",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "idsOfGroupsEnteredByUser",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "isAdded",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "isOwner",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userToGroupsEntered",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "groupName",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_groupName",
                "type": "string"
            }
        ],
        "name": "createGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_groupId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_member",
                "type": "address"
            }
        ],
        "name": "addMember",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_groupId",
                "type": "uint256"
            }
        ],
        "name": "getGroupById",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "groupName",
                        "type": "string"
                    },
                    {
                        "internalType": "address[]",
                        "name": "membersAddress",
                        "type": "address[]"
                    },
                    {
                        "internalType": "address[]",
                        "name": "senderOfEachMessage",
                        "type": "address[]"
                    },
                    {
                        "internalType": "string[]",
                        "name": "chatLog",
                        "type": "string[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "timestampOfEachMessage",
                        "type": "uint256[]"
                    }
                ],
                "internalType": "struct Grupos.GroupChat",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "getYourGroupsInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "groupName",
                        "type": "string"
                    },
                    {
                        "internalType": "address[]",
                        "name": "membersAddress",
                        "type": "address[]"
                    },
                    {
                        "internalType": "address[]",
                        "name": "senderOfEachMessage",
                        "type": "address[]"
                    },
                    {
                        "internalType": "string[]",
                        "name": "chatLog",
                        "type": "string[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "timestampOfEachMessage",
                        "type": "uint256[]"
                    }
                ],
                "internalType": "struct Grupos.GroupChat[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_groupId",
                "type": "uint256"
            }
        ],
        "name": "getGroupMembers",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_pubkey",
                "type": "address"
            }
        ],
        "name": "checkUserExists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_pubkey",
                "type": "address"
            }
        ],
        "name": "getUserName",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_groupId",
                "type": "uint256"
            }
        ],
        "name": "getChatLog",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_groupId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_msg",
                "type": "string"
            }
        ],
        "name": "sendMsgToGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_groupId",
                "type": "uint256"
            }
        ],
        "name": "getMessagesSentInGroup",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    }
]

const contractGroupChatABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "addressToUserPrivate",
        "outputs": [
            {
                "internalType": "string",
                "name": "userName",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "pubKey",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "allMessages",
        "outputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_msg",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "requestChecker",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "users",
        "outputs": [
            {
                "internalType": "string",
                "name": "userName",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "accountAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_pubkey",
                "type": "address"
            }
        ],
        "name": "checkUserExists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_userName",
                "type": "string"
            }
        ],
        "name": "createAccount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_pubkey",
                "type": "address"
            }
        ],
        "name": "getUsername",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_sendTo",
                "type": "address"
            }
        ],
        "name": "sendFriendRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPendingRequests",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "pubKey",
                        "type": "address"
                    }
                ],
                "internalType": "struct GroupChatImplementation.Request[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_requestIndex",
                "type": "uint256"
            }
        ],
        "name": "acceptPendingRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_requestIndex",
                "type": "uint256"
            }
        ],
        "name": "denyPendingRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDenyRequests",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "pubKey",
                        "type": "address"
                    }
                ],
                "internalType": "struct GroupChatImplementation.Request[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_account2",
                "type": "address"
            }
        ],
        "name": "alreadyFriends",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "getFriends",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "userName",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "accountAddress",
                        "type": "address"
                    }
                ],
                "internalType": "struct GroupChatImplementation.GenericUser[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "friend_key",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_msg",
                "type": "string"
            }
        ],
        "name": "sendMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "friend_key",
                "type": "address"
            }
        ],
        "name": "readMessage",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_msg",
                        "type": "string"
                    }
                ],
                "internalType": "struct GroupChatImplementation.Message[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    }
]





const instanceGroup = new web3.eth.Contract(contractGroupABI, contractGroupAddress)
const instanceGroupChat = new web3.eth.Contract(contractGroupChatABI, contractGroupChatAddress)

//\Dados Contrato

//ELEMENTOS HTML
const sendMsgBtn = document.getElementById("sendMsgBtn")
const connectWalletBtn = document.getElementById("connectWalletBtn")
const chatBox = document.getElementById("chatBox")
const sendMsgInput = document.getElementById("sendMsgInput")
const areaDeContatos = document.getElementById("areaDeContatos")
const accountNickname = document.getElementById("accountNickname")
const friendAddress = document.getElementById("friendAddress")
const sendFriendrequestInput = document.getElementById("add-friend-inp")
const sendFriendRequestBtn = document.getElementById("add-friend-btn")
const accountCreationInput = document.getElementById("create-account-inp")
const accountCreationBtn = document.getElementById("create-account-btn")
const createGroupBtn = document.getElementById("create-group-btn")
const nameGroupInput = document.getElementById("name-group-inp")
const addMemberBtn = document.getElementById("add-member-btn")
const addMemberInput = document.getElementById("add-member-inp")
const footer = document.getElementById("footer");


//\ELEMENTOS HTML

//DADOS

let accountConnected
let friendsList
let chatLog = []
let pendingRequests = []
let requestsBtnAccept = [];
let requestsBtnDeny = [];
let requests = [];
let denyRequests = [];
let idToAdd;
//\DADOS


//async functions (solidity)

async function acceptPendingRequest(_requestIndex) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let pedidoAceito = await instanceGroupChat.methods.acceptPendingRequest(_requestIndex).send({ from: accounts[0] })
            return pedidoAceito
        } catch (error) {
            console.log(error)
        }
    } else {
        alert("Please Install Metamask!!")
    }
}

async function denyPendingRequest(_requestIndex) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let pedidoAceito = await instanceGroupChat.methods.denyPendingRequest(_requestIndex).send({ from: accounts[0] })
            return pedidoAceito
        } catch (error) {
            console.log(error)
        }
    } else {
        alert("Please Install Metamask!!")
    }
}

async function getPendingRequests() {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroupChat.methods.getPendingRequests().call({ from: accounts[0] })
            return call
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}

async function getDenyRequests() {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroupChat.methods.getDenyRequests().call({ from: accounts[0] })
            return call
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}

async function createAccount(_nickname) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let contaCriada = await instanceGroupChat.methods.createAccount(_nickname).send({ from: accounts[0] })
            return contaCriada
        } catch (error) {
            console.log(error)
        }
    } else {
        alert("Please Install Metamask!!")
    }
}
async function sendFriendRequest(_to) {
    try {
        let accounts = await ethereum.request({ method: "eth_requestAccounts" })
        let pedido = await instanceGroupChat.methods.sendFriendRequest(_to).send({ from: accounts[0] })
        return pedido
    } catch (error) {
        console.log(error);
    }
}
async function connectWallet() {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            return accounts[0]
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}

async function getFriends() {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroupChat.methods.getFriends().call({ from: accounts[0] })
            return call
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}
async function getAccountLogged() {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })

            return accounts[0]
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}

async function checkAccountLogged() {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            let sendCall = await instanceGroupChat.methods.checkUserExists(accounts[0]).call({ from: accounts[0] });
            return sendCall;
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}


async function sendMessage(_to, _message) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroupChat.methods.sendMessage(_to, _message).send({ from: accounts[0] })
            return call
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask")
    }
}

async function readMessage(_address) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            let sendCall = await instanceGroupChat.methods.readMessage(_address).call({ from: accounts[0] });
            return sendCall;
        } catch (err) {
            console.log(err)
        }
    } else {
        alert("Connect to Goerli");
    }
}
//\async functions (solidity)

let contactsNumber;
let friendsBtn = []

//cria os botoes
if (/* contaCriada */true) {
    getGroups().then((groupsList) => {
        getFriends().then((friendsList) => {

            if (groupsList != undefined)
                contactsNumber = friendsList.length + groupsList.length;

            if (groupsList.length > 0) {
                var sentButtonGroup = document.createElement("button");
                sentButtonGroup.id = "sendMsgBtn";
                sentButtonGroup.innerHTML = "SEND TO GROUP";
                footer.appendChild(sentButtonGroup);
            }


            for (let i = 0; i < friendsList.length; i++) {
                friendsBtn[i] = document.createElement("button")
                friendsBtn[i].className = "contactsBtn"
                friendsBtn[i].innerHTML = friendsList[i].userName
                areaDeContatos.appendChild(friendsBtn[i])
            }
            for (let i = friendsList.length; i < contactsNumber; i++) {
                friendsBtn[i] = document.createElement("button")
                friendsBtn[i].className = "groupsBtn"
                friendsBtn[i].innerHTML = groupsList[i - friendsList.length].groupName
                areaDeContatos.appendChild(friendsBtn[i])
            }

            if (groupsList.length > 0) {
                sentButtonGroup.addEventListener("click", () => {
                    sendMessageToGroup(idToAdd, sendMsgInput.value).then(() => {

                    }).catch((error) => {
                        console.log(error)
                    })
                })
            }





            //a partir dos clicks dos botoes

            for (let i = 0; i < friendsList.length; i++) {
                friendsBtn[i].addEventListener("click", () => {
                    chatBox.innerHTML = ""
                    accountNickname.innerHTML = friendsList[i].userName
                    friendAddress.innerHTML = friendsList[i].accountAddress
                    readMessage(friendsList[i].accountAddress).then((conversa) => {
                        chatLog = conversa
                        let mensagem = []
                        let date = []
                        for (let j = 0; j < chatLog.length; j++) {
                            mensagem[j] = document.createElement("p")
                            mensagem[j].innerHTML = chatLog[j]._msg
                            date[j] = document.createElement("p")
                            let time = new Date(chatLog[j].timestamp * 1000)
                            time = time.toLocaleDateString() + " " + time.toLocaleTimeString()
                            date[j].innerHTML = time;
                            if (chatLog[j].sender == friendsList[i].accountAddress) {
                                mensagem[j].className = "message"
                                date[j].className = "date";
                            } else {
                                mensagem[j].className = "user_message"
                                date[j].className = "user_date"
                            }

                            chatBox.appendChild(mensagem[j])
                            mensagem[j].appendChild(date[j]);
                        }

                    }).catch((error) => {
                        console.log(error);
                    })
                })
            }
        })
    })
}
if (/* contaCriada */true) {
    getGroups().then((groupsList) => {
        getFriends().then((friendsList) => {
            if (groupsList != undefined)
                contactsNumber = friendsList.length + groupsList.length;
            for (let i = friendsList.length; i < contactsNumber; i++) {
                friendsBtn[i].addEventListener("click", () => {
                    chatBox.innerHTML = ""
                    accountNickname.innerHTML = groupsList[i - friendsList.length].groupName;
                    idToAdd = groupsList[i - friendsList.length].id;
                    getGroupMembers(groupsList[i - friendsList.length].id).then((members) => {
                        friendAddress.innerHTML = members;
                    })
                    readMessageGroup(groupsList[i - friendsList.length].id).then((conversa) => {
                        getAccountLogged().then((contaLogada) => {


                            chatLog = conversa
                            let sendersOf = groupsList[i - friendsList.length].senderOfEachMessage;
                            let messageTimestamp = groupsList[i - friendsList.length].timestampOfEachMessage;
                            //console.log(sendersOf);
                            let mensagem = []
                            let timestamp = []
                            let nicknames = []
                            for (let j = 0; j < chatLog.length; j++) {
                                console.log(sendersOf[j])
                                nicknames[j] = document.createElement("p")
                                getUserName(sendersOf[j]).then((userName) => {
                                    nicknames[j].innerHTML = userName;
                                    nicknames[j].className = "message"
                                    mensagem[j] = document.createElement("p")
                                    mensagem[j].innerHTML = chatLog[j]
                                    mensagem[j].className = "message-text"
                                    nicknames[j].appendChild(mensagem[j]);
                                    timestamp[j] = document.createElement("p")
                                    let time = new Date(messageTimestamp[j] * 1000)
                                    time = time.toLocaleDateString() + " " + time.toLocaleTimeString()
                                    timestamp[j].innerHTML = time
                                    timestamp[j].className = "date";
                                    nicknames[j].appendChild(timestamp[j]);
                                    if (sendersOf[j].toUpperCase() == contaLogada.toUpperCase()) {
                                        nicknames[j].className = "user_message"
                                        timestamp[j].className = "user_date";
                                    }

                                    chatBox.appendChild(nicknames[j])
                                })
                            }

                        }).catch((error) => { console.log(error) })

                    }).catch((error) => {
                        console.log(error);
                    })
                })
            }
        })
    })
}
//cria os botoes request
if (/* contaCriada */true) {
    getDenyRequests().then((denyRequests) => {
        getPendingRequests().then((pendingRequests) => {
            for (let i = 0; i < pendingRequests.length; i++) {
                requests[i] = document.createElement("div")
                requests[i].className = "requests"
                requests[i].innerHTML = pendingRequests[i].name
                requestsBtnAccept[i] = document.createElement("button")
                requestsBtnAccept[i].className = "requestsBtnAccept"
                requestsBtnAccept[i].innerHTML = "SIM"
                requestsBtnDeny[i] = document.createElement("button")
                requestsBtnDeny[i].className = "requestsBtnDeny"
                requestsBtnDeny[i].innerHTML = "NÃO"
                let aceito = false;
                getFriends().then((friendsList) => {
                    if (friendsList.length != undefined) {

                        for (let j = 0; j < friendsList.length; j++) {

                            if (pendingRequests[i].pubKey == friendsList[j].accountAddress) {
                                aceito = true;
                            }
                        }
                    }
                    if (denyRequests.length != undefined) {
                        for (let j = 0; j < denyRequests.length; j++) {
                            if (pendingRequests[i].pubKey == denyRequests[j].pubKey) {

                                aceito = true;
                            }
                        }
                    }
                    if (!aceito) {
                        areaDeRequests.appendChild(requests[i])
                        requests[i].appendChild(requestsBtnAccept[i])
                        requests[i].appendChild(requestsBtnDeny[i])
                    }
                })
            }




            sendMsgBtn.addEventListener("click", () => {
                sendMessage(friendAddress.innerHTML, sendMsgInput.value).then(() => {

                }).catch((error) => {
                    console.log(error)
                })
            })
            //aceita os pedidos
            for (let i = 0; i < requests.length; i++) {
                requestsBtnAccept[i].addEventListener("click", () => {
                    acceptPendingRequest(i).then((res) => {
                        console.log(res);
                    }).catch((err) => {
                        console.log(err);
                    });
                });
            }

            //nega os pedidos
            for (let i = 0; i < requests.length; i++) {
                requestsBtnDeny[i].addEventListener("click", () => {
                    denyPendingRequest(i).then((res) => {
                        alert("Pedido negado!");
                        console.log(res);
                    }).catch((err) => {
                        console.log(err);
                    });
                });
            }
        })
    })
}
sendFriendRequestBtn.addEventListener("click", () => {
    sendFriendRequest(sendFriendrequestInput.value).then((pedido) => {
        alert("Pedido enviado!")
    }).catch((error => {
        console.log(error)
    }))
})
accountCreationBtn.addEventListener("click", () => {
    createAccount(accountCreationInput.value).then((contaCriada) => {
        alert("Conta Criada!")
    }).catch((error) => {
        console.log(error)
    })
})

connectWalletBtn.addEventListener("click", () => {
    connectWallet().then((res) => {
        connectWalletBtn.innerHTML = res.slice(0, 7) + "..." + res.slice(35, -1);
        alert("conected");
    }).catch((err) => {
        alert(err);
    })
});

async function createGroup(_name) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroup.methods.createGroup(_name).send({ from: accounts[0] })
            return call
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask")
    }
}

createGroupBtn.addEventListener("click", () => {
    createGroup(nameGroupInput.value).then((grupo) => {
        alert(grupo)
    }).catch((error) => {
        console.log(error)
    })
})

async function addMember(_id, _address) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroup.methods.addMember(_id, _address).send({ from: accounts[0] })
            return call
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask")
    }
}

addMemberBtn.addEventListener("click", () => {
    addMember(idToAdd, addMemberInput.value).then((res) => {
        alert(res)
    }).catch((error) => {
        console.log(error)
    })
})

async function getGroups() {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroup.methods.getYourGroupsInfo().call({ from: accounts[0] })
            return call;
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}

async function getGroupMembers(id) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroup.methods.getGroupMembers(id).call({ from: accounts[0] })
            let members = [];
            for (let i = 0; i < call.length; i++) {
                let userName = await instanceGroup.methods.getUserName(call[i]).call({ from: accounts[0] })
                members.push(userName);

            }
            return members;
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}


async function readMessageGroup(id) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroup.methods.getChatLog(id).call({ from: accounts[0] })
            return call;
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask!")
    }
}



async function sendMessageToGroup(_id, _message) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let call = await instanceGroup.methods.sendMsgToGroup(_id, _message).send({ from: accounts[0] })
            return call
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask")
    }
}


async function getUserName(_address) {
    if (ethereum) {
        try {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" })
            let userName = await instanceGroup.methods.getUserName(_address).call({ from: accounts[0] })
            return userName;
        } catch (error) {
            console.log(error);
        }
    } else {
        alert("Please Install Metamask")

    }
}
