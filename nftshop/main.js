let provider;
let signer;
let connected = false;
let deployedCollectionContract = null; // To store the deployed contract instance
let deployerAddress = null;

const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const yourWalletInput = document.getElementById('yourWallet');

// Collection Deployment Elements
const createTokenBtn = document.getElementById('createToken');
const outputDiv = document.getElementById('output');
const collectionNameInput = document.getElementById('name');
const collectionSymbolInput = document.getElementById('symbol');

// Minting Section Elements (assuming they exist in HTML now)
const mintingSection = document.getElementById('mintingSection');
const collectionContractAddressSpan = document.getElementById('collectionContractAddress');
const nextTokenIdDisplaySpan = document.getElementById('nextTokenIdDisplay');
const nftNameInput = document.getElementById('nftName');
const nftDescriptionInput = document.getElementById('nftDescription');
const nftImageUrlInput = document.getElementById('nftImageUrl');
const generateMetadataBtn = document.getElementById('generateMetadataBtn');
const metadataJsonOutputTextarea = document.getElementById('metadataJsonOutput');
const nftMetadataIpfsUrlInput = document.getElementById('nftMetadataIpfsUrl');
const mintNftBtn = document.getElementById('mintNftBtn');
const mintOutputDiv = document.getElementById('mintOutput');


connectBtn.addEventListener('click', connectWallet);

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    statusDiv.innerText = '❌ MetaMask is not installed.';
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    deployerAddress = accounts[0];
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    yourWalletInput.value = deployerAddress;
    statusDiv.innerText = '✅ Wallet connected.';
    connected = true;
  } catch (err) {
    statusDiv.innerText = '❌ Wallet connection was cancelled or failed.';
    console.error(err);
  }
}

const erc721Bytecode = '608060405234801562000010575f80fd5b5060405162002d1b38038062002d1b833981810160405281019062000036919062000333565b338282815f9081620000499190620005ed565b5080600190816200005b9190620005ed565b5050505f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603620000d1575f6040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600401620000c8919062000714565b60405180910390fd5b620000e281620000eb60201b60201c565b5050506200072f565b5f60075f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508160075f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b5f604051905090565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6200020f82620001c7565b810181811067ffffffffffffffff82111715620002315762000230620001d7565b5b80604052505050565b5f62000245620001ae565b905062000253828262000204565b919050565b5f67ffffffffffffffff821115620002755762000274620001d7565b5b6200028082620001c7565b9050602081019050919050565b5f5b83811015620002ac5780820151818401526020810190506200028f565b5f8484015250505050565b5f620002cd620002c78462000258565b6200023a565b905082815260208101848484011115620002ec57620002eb620001c3565b5b620002f98482856200028d565b509392505050565b5f82601f830112620003185762000317620001bf565b5b81516200032a848260208601620002b7565b91505092915050565b5f80604083850312156200034c576200034b620001b7565b5b5f83015167ffffffffffffffff8111156200036c576200036b620001bb565b5b6200037a8582860162000301565b925050602083015167ffffffffffffffff8111156200039e576200039d620001bb565b5b620003ac8582860162000301565b9150509250929050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806200040557607f821691505b6020821081036200041b576200041a620003c0565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026200047f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000442565b6200048b868362000442565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f620004d5620004cf620004c984620004a3565b620004ac565b620004a3565b9050919050565b5f819050919050565b620004f083620004b5565b62000508620004ff82620004dc565b8484546200044e565b825550505050565b5f90565b6200051e62000510565b6200052b818484620004e5565b505050565b5b818110156200055257620005465f8262000514565b60018101905062000531565b5050565b601f821115620005a1576200056b8162000421565b620005768462000433565b8101602085101562000586578190505b6200059e620005958562000433565b83018262000530565b50505b505050565b5f82821c905092915050565b5f620005c35f1984600802620005a6565b1980831691505092915050565b5f620005dd8383620005b2565b9150826002028217905092915050565b620005f882620003b6565b67ffffffffffffffff811115620006145762000613620001d7565b5b620006208254620003ed565b6200062d82828562000556565b5f60209050601f83116001811462000663575f84156200064e578287015190505b6200065a8582620005d0565b865550620006c9565b601f198416620006738662000421565b5f5b828110156200069c5784890151825560018201915060208501945060208101905062000675565b86831015620006bc5784890151620006b8601f891682620005b2565b8355505b6001600288020188555050505b505050505050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f620006fc82620006d1565b9050919050565b6200070e81620006f0565b82525050565b5f602082019050620007295f83018462000703565b92915050565b6125de806200073d5f395ff3fe608060405234801561000f575f80fd5b5060043610610114575f3560e01c806375794a3c116100a0578063b88d4fde1161006f578063b88d4fde146102ca578063c87b56dd146102e6578063e985e9c514610316578063eacabe1414610346578063f2fde38b1461037657610114565b806375794a3c146102545780638da5cb5b1461027257806395d89b4114610290578063a22cb465146102ae57610114565b806323b872dd116100e757806323b872dd146101b257806342842e0e146101ce5780636352211e146101ea57806370a082311461021a578063715018a61461024a57610114565b806301ffc9a71461011857806306fdde0314610148578063081812fc14610166578063095ea7b314610196575b5f80fd5b610132600480360381019061012d9190611a64565b610392565b60405161013f9190611aa9565b60405180910390f35b6101506103f2565b60405161015d9190611b4c565b60405180910390f35b610180600480360381019061017b9190611b9f565b610481565b60405161018d9190611c09565b60405180910390f35b6101b060048036038101906101ab9190611c4c565b61049c565b005b6101cc60048036038101906101c79190611c8a565b6104b2565b005b6101e860048036038101906101e39190611c8a565b6105b1565b005b61020460048036038101906101ff9190611b9f565b6105d0565b6040516102119190611c09565b60405180910390f35b610234600480360381019061022f9190611cda565b6105e1565b6040516102419190611d14565b60405180910390f35b610252610697565b005b61025c6106aa565b6040516102699190611d14565b60405180910390f35b61027a6106bf565b6040516102879190611c09565b60405180910390f35b6102986106e7565b6040516102a59190611b4c565b60405180910390f35b6102c860048036038101906102c39190611d57565b610777565b005b6102e460048036038101906102df9190611ec1565b61078d565b005b61030060048036038101906102fb9190611b9f565b6107b2565b60405161030d9190611b4c565b60405180910390f35b610330600480360381019061032b9190611f41565b6108bd565b60405161033d9190611aa9565b60405180910390f35b610360600480360381019061035b919061201d565b61094b565b60405161036d9190611d14565b60405180910390f35b610390600480360381019061038b9190611cda565b61098f565b005b5f634906490660e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806103eb57506103ea82610a13565b5b9050919050565b60605f8054610400906120a4565b80601f016020809104026020016040519081016040528092919081815260200182805461042c906120a4565b80156104775780601f1061044e57610100808354040283529160200191610477565b820191905f5260205f20905b81548152906001019060200180831161045a57829003601f168201915b5050505050905090565b5f61048b82610af4565b5061049582610b7a565b9050919050565b6104ae82826104a9610bb3565b610bba565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610522575f6040517f64a0ae920000000000000000000000000000000000000000000000000000000081526004016105199190611c09565b60405180910390fd5b5f6105358383610530610bb3565b610bcc565b90508373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146105ab578382826040517f64283d7b0000000000000000000000000000000000000000000000000000000081526004016105a2939291906120d4565b60405180910390fd5b50505050565b6105cb83838360405180602001604052805f81525061078d565b505050565b5f6105da82610af4565b9050919050565b5f8073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610652575f6040517f89c62b640000000000000000000000000000000000000000000000000000000081526004016106499190611c09565b60405180910390fd5b60035f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20549050919050565b61069f610dd7565b6106a85f610e5e565b565b5f60016008546106ba9190612136565b905090565b5f60075f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6060600180546106f6906120a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610722906120a4565b801561076d5780601f106107445761010080835404028352916020019161076d565b820191905f5260205f20905b81548152906001019060200180831161075057829003601f168201915b5050505050905090565b610789610782610bb3565b8383610f21565b5050565b6107988484846104b2565b6107ac6107a3610bb3565b8585858561108a565b50505050565b60606107bd82610af4565b505f60065f8481526020019081526020015f2080546107db906120a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610807906120a4565b80156108525780601f1061082957610100808354040283529160200191610852565b820191905f5260205f20905b81548152906001019060200180831161083557829003601f168201915b505050505090505f610862611236565b90505f8151036108765781925050506108b8565b5f825111156108aa5780826040516020016108929291906121a3565b604051602081830303815290604052925050506108b8565b6108b38461124c565b925050505b919050565b5f60055f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff16905092915050565b5f610954610dd7565b60085f815480929190610966906121c6565b91905055505f600854905061097b84826112b2565b61098581846113a5565b8091505092915050565b610997610dd7565b5f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610a07575f6040517f1e4fbdf70000000000000000000000000000000000000000000000000000000081526004016109fe9190611c09565b60405180910390fd5b610a1081610e5e565b50565b5f7f80ac58cd000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161480610add57507f5b5e139f000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b80610aed5750610aec826113ff565b5b9050919050565b5f80610aff83611468565b90505f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610b7157826040517f7e273289000000000000000000000000000000000000000000000000000000008152600401610b689190611d14565b60405180910390fd5b80915050919050565b5f60045f8381526020019081526020015f205f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b5f33905090565b610bc783838360016114a1565b505050565b5f80610bd784611468565b90505f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614610c1857610c17818486611660565b5b5f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610ca357610c575f855f806114a1565b600160035f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825403925050819055505b5f73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1614610d2257600160035f8773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825401925050819055505b8460025f8681526020019081526020015f205f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550838573ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4809150509392505050565b610ddf610bb3565b73ffffffffffffffffffffffffffffffffffffffff16610dfd6106bf565b73ffffffffffffffffffffffffffffffffffffffff1614610e5c57610e20610bb3565b6040517f118cdaa7000000000000000000000000000000000000000000000000000000008152600401610e539190611c09565b60405180910390fd5b565b5f60075f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508160075f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610f9157816040517f5b08ba18000000000000000000000000000000000000000000000000000000008152600401610f889190611c09565b60405180910390fd5b8060055f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405161107d9190611aa9565b60405180910390a3505050565b5f8373ffffffffffffffffffffffffffffffffffffffff163b111561122f578273ffffffffffffffffffffffffffffffffffffffff1663150b7a02868685856040518563ffffffff1660e01b81526004016110e8949392919061225f565b6020604051808303815f875af192505050801561112357506040513d601f19601f8201168201806040525081019061112091906122bd565b60015b6111a4573d805f8114611151576040519150601f19603f3d011682016040523d82523d5f602084013e611156565b606091505b505f81510361119c57836040517f64a0ae920000000000000000000000000000000000000000000000000000000081526004016111939190611c09565b60405180910390fd5b805181602001fd5b63150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161461122d57836040517f64a0ae920000000000000000000000000000000000000000000000000000000081526004016112249190611c09565b60405180910390fd5b505b5050505050565b606060405180602001604052805f815250905090565b606061125782610af4565b505f611261611236565b90505f81511161127f5760405180602001604052805f8152506112aa565b8061128984611723565b60405160200161129a9291906121a3565b6040516020818303038152906040525b915050919050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611322575f6040517f64a0ae920000000000000000000000000000000000000000000000000000000081526004016113199190611c09565b60405180910390fd5b5f61132e83835f610bcc565b90505f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16146113a0575f6040517f73c6ac6e0000000000000000000000000000000000000000000000000000000081526004016113979190611c09565b60405180910390fd5b505050565b8060065f8481526020019081526020015f2090816113c39190612485565b507ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7826040516113f39190611d14565b60405180910390a15050565b5f7f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b5f60025f8381526020019081526020015f205f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b80806114d957505f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614155b1561160b575f6114e884610af4565b90505f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415801561155257508273ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614155b8015611565575061156381846108bd565b155b156115a757826040517fa9fbf51f00000000000000000000000000000000000000000000000000000000815260040161159e9190611c09565b60405180910390fd5b811561160957838573ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b8360045f8581526020019081526020015f205f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505050565b61166b8383836117ed565b61171e575f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036116df57806040517f7e2732890000000000000000000000000000000000000000000000000000000081526004016116d69190611d14565b60405180910390fd5b81816040517f177e802f000000000000000000000000000000000000000000000000000000008152600401611715929190612554565b60405180910390fd5b505050565b60605f6001611731846118ad565b0190505f8167ffffffffffffffff81111561174f5761174e611d9d565b5b6040519080825280601f01601f1916602001820160405280156117815781602001600182028036833780820191505090505b5090505f82602001820190505b6001156117e2578080600190039150507f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a85816117d7576117d661257b565b5b0494505f850361178e575b819350505050919050565b5f8073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141580156118a457508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480611865575061186484846108bd565b5b806118a357508273ffffffffffffffffffffffffffffffffffffffff1661188b83610b7a565b73ffffffffffffffffffffffffffffffffffffffff16145b5b90509392505050565b5f805f90507a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008310611909577a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000083816118ff576118fe61257b565b5b0492506040810190505b6d04ee2d6d415b85acef81000000008310611946576d04ee2d6d415b85acef8100000000838161193c5761193b61257b565b5b0492506020810190505b662386f26fc10000831061197557662386f26fc10000838161196b5761196a61257b565b5b0492506010810190505b6305f5e100831061199e576305f5e10083816119945761199361257b565b5b0492506008810190505b61271083106119c35761271083816119b9576119b861257b565b5b0492506004810190505b606483106119e657606483816119dc576119db61257b565b5b0492506002810190505b600a83106119f5576001810190505b80915050919050565b5f604051905090565b5f80fd5b5f80fd5b5f7fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b611a4381611a0f565b8114611a4d575f80fd5b50565b5f81359050611a5e81611a3a565b92915050565b5f60208284031215611a7957611a78611a07565b5b5f611a8684828501611a50565b91505092915050565b5f8115159050919050565b611aa381611a8f565b82525050565b5f602082019050611abc5f830184611a9a565b92915050565b5f81519050919050565b5f82825260208201905092915050565b5f5b83811015611af9578082015181840152602081019050611ade565b5f8484015250505050565b5f601f19601f8301169050919050565b5f611b1e82611ac2565b611b288185611acc565b9350611b38818560208601611adc565b611b4181611b04565b840191505092915050565b5f6020820190508181035f830152611b648184611b14565b905092915050565b5f819050919050565b611b7e81611b6c565b8114611b88575f80fd5b50565b5f81359050611b9981611b75565b92915050565b5f60208284031215611bb457611bb3611a07565b5b5f611bc184828501611b8b565b91505092915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f611bf382611bca565b9050919050565b611c0381611be9565b82525050565b5f602082019050611c1c5f830184611bfa565b92915050565b611c2b81611be9565b8114611c35575f80fd5b50565b5f81359050611c4681611c22565b92915050565b5f8060408385031215611c6257611c61611a07565b5b5f611c6f85828601611c38565b9250506020611c8085828601611b8b565b9150509250929050565b5f805f60608486031215611ca157611ca0611a07565b5b5f611cae86828701611c38565b9350506020611cbf86828701611c38565b9250506040611cd086828701611b8b565b9150509250925092565b5f60208284031215611cef57611cee611a07565b5b5f611cfc84828501611c38565b91505092915050565b611d0e81611b6c565b82525050565b5f602082019050611d275f830184611d05565b92915050565b611d3681611a8f565b8114611d40575f80fd5b50565b5f81359050611d5181611d2d565b92915050565b5f8060408385031215611d6d57611d6c611a07565b5b5f611d7a85828601611c38565b9250506020611d8b85828601611d43565b9150509250929050565b5f80fd5b5f80fd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b611dd382611b04565b810181811067ffffffffffffffff82111715611df257611df1611d9d565b5b80604052505050565b5f611e046119fe565b9050611e108282611dca565b919050565b5f67ffffffffffffffff821115611e2f57611e2e611d9d565b5b611e3882611b04565b9050602081019050919050565b828183375f83830152505050565b5f611e65611e6084611e15565b611dfb565b905082815260208101848484011115611e8157611e80611d99565b5b611e8c848285611e45565b509392505050565b5f82601f830112611ea857611ea7611d95565b5b8135611eb8848260208601611e53565b91505092915050565b5f805f8060808587031215611ed957611ed8611a07565b5b5f611ee687828801611c38565b9450506020611ef787828801611c38565b9350506040611f0887828801611b8b565b925050606085013567ffffffffffffffff811115611f2957611f28611a0b565b5b611f3587828801611e94565b91505092959194509250565b5f8060408385031215611f5757611f56611a07565b5b5f611f6485828601611c38565b9250506020611f7585828601611c38565b9150509250929050565b5f67ffffffffffffffff821115611f9957611f98611d9d565b5b611fa282611b04565b9050602081019050919050565b5f611fc1611fbc84611f7f565b611dfb565b905082815260208101848484011115611fdd57611fdc611d99565b5b611fe8848285611e45565b509392505050565b5f82601f83011261200457612003611d95565b5b8135612014848260208601611faf565b91505092915050565b5f806040838503121561203357612032611a07565b5b5f61204085828601611c38565b925050602083013567ffffffffffffffff81111561206157612060611a0b565b5b61206d85828601611ff0565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806120bb57607f821691505b6020821081036120ce576120cd612077565b5b50919050565b5f6060820190506120e75f830186611bfa565b6120f46020830185611d05565b6121016040830184611bfa565b949350505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61214082611b6c565b915061214b83611b6c565b925082820190508082111561216357612162612109565b5b92915050565b5f81905092915050565b5f61217d82611ac2565b6121878185612169565b9350612197818560208601611adc565b80840191505092915050565b5f6121ae8285612173565b91506121ba8284612173565b91508190509392505050565b5f6121d082611b6c565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361220257612201612109565b5b600182019050919050565b5f81519050919050565b5f82825260208201905092915050565b5f6122318261220d565b61223b8185612217565b935061224b818560208601611adc565b61225481611b04565b840191505092915050565b5f6080820190506122725f830187611bfa565b61227f6020830186611bfa565b61228c6040830185611d05565b818103606083015261229e8184612227565b905095945050505050565b5f815190506122b781611a3a565b92915050565b5f602082840312156122d2576122d1611a07565b5b5f6122df848285016122a9565b91505092915050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026123447fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82612309565b61234e8683612309565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61238961238461237f84611b6c565b612366565b611b6c565b9050919050565b5f819050919050565b6123a28361236f565b6123b66123ae82612390565b848454612315565b825550505050565b5f90565b6123ca6123be565b6123d5818484612399565b505050565b5b818110156123f8576123ed5f826123c2565b6001810190506123db565b5050565b601f82111561243d5761240e816122e8565b612417846122fa565b81016020851015612426578190505b61243a612432856122fa565b8301826123da565b50505b505050565b5f82821c905092915050565b5f61245d5f1984600802612442565b1980831691505092915050565b5f612475838361244e565b9150826002028217905092915050565b61248e82611ac2565b67ffffffffffffffff8111156124a7576124a6611d9d565b5b6124b182546120a4565b6124bc8282856123fc565b5f60209050601f8311600181146124ed575f84156124db578287015190505b6124e5858261246a565b86555061254c565b601f1984166124fb866122e8565b5f5b82811015612522578489015182556001820191506020850194506020810190506124fd565b8683101561253f578489015161253b601f89168261244e565b8355505b6001600288020188555050505b505050505050565b5f6040820190506125675f830185611bfa565b6125746020830184611d05565b9392505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffdfea2646970667358221220f2afb39a12c1faec5c4d09b2167158fd0dc2346526d8c9983befb260d1b28b7d64736f6c63430008180033';

const erc721ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "tokenURI",
				"type": "string"
			}
		],
		"name": "mintNFT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextTokenId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

// Listener for the create collection button
if (createTokenBtn) {
  createTokenBtn.addEventListener("click", async () => {
    outputDiv.textContent = "";
    if (mintingSection) mintingSection.style.display = 'none';
    if (mintOutputDiv) mintOutputDiv.textContent = "";


    if (!connected || !signer) {
      outputDiv.textContent = "⛔ Please connect your wallet first.";
      return;
    }

    const collectionName = collectionNameInput.value.trim();
    const collectionSymbol = collectionSymbolInput.value.trim();

    if (!collectionName || !collectionSymbol) {
      outputDiv.textContent = "⚠️ Please fill in Collection Name and Symbol correctly.";
      return;
    }

    if (erc721Bytecode === "0xYOUR_COMPILED_MyCustomNFT_BYTECODE_HERE" || !erc721Bytecode.startsWith("0x") || erc721Bytecode.length < 60) {
      outputDiv.innerHTML = 
        ⚠️ **CRITICAL ERROR:** ERC721 Bytecode is not set or is invalid in main.js!<br>
        Please compile the MyCustomNFT.sol contract (see README.md) and replace the placeholder erc721Bytecode value in main.js with the actual compiled bytecode.
      ;
      return;
    }

    outputDiv.textContent = '🚀 Deploying NFT Collection (${collectionSymbol})... Please wait.';

    try {
      const factory = new ethers.ContractFactory(erc721ABI, erc721Bytecode, signer);
      const contract = await factory.deploy(collectionName, collectionSymbol);

      outputDiv.textContent = '⏳ Waiting for transaction confirmation...\nTX Hash';

      const receipt = await contract.waitForDeployment();
      const contractAddress = await receipt.getAddress();

      outputDiv.textContent = '✅ NFT Collection deployed successfully!\nContract Address: ${contractAddress}\nTX Hash';

      deployedCollectionContract = new ethers.Contract(contractAddress, erc721ABI, signer);
      if (mintingSection) {
          mintingSection.style.display = 'block';
      }
      if (collectionContractAddressSpan) {
        collectionContractAddressSpan.innerText = contractAddress;
      }
      updateNextTokenIdDisplay();

    } catch (err) {
      outputDiv.textContent = '❌ Error deploying collection: ${err.message || err}';
      console.error(err);
    }
  });
}


async function updateNextTokenIdDisplay() {
    if (deployedCollectionContract && nextTokenIdDisplaySpan) {
        nextTokenIdDisplaySpan.innerText = "Fetching...";
        try {
            const nextId = await deployedCollectionContract.getNextTokenId();
            nextTokenIdDisplaySpan.innerText = nextId.toString();
        } catch (err) {
            console.error("Could not fetch next token ID:", err);
            nextTokenIdDisplaySpan.innerText = "Error";
        }
    }
}

if (generateMetadataBtn) {
  generateMetadataBtn.addEventListener('click', () => {
    const name = nftNameInput.value.trim();
    const description = nftDescriptionInput.value.trim();
    const imageUrl = nftImageUrlInput.value.trim();

    if (!name || !description || !imageUrl) {
      metadataJsonOutputTextarea.value = "Please fill in NFT Name, Description, and Image URL first.";
      return;
    }

    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      // attributes: [] // Optional: add attributes if needed in the future
    };
    metadataJsonOutputTextarea.value = JSON.stringify(metadata, null, 2);
  });
}

if (mintNftBtn) {
  mintNftBtn.addEventListener('click', async () => {
    if (!connected || !signer || !deployedCollectionContract) {
      mintOutputDiv.textContent = "⛔ Please connect wallet and deploy a collection first.";
      return;
    }

    const metadataIpfsUrl = nftMetadataIpfsUrlInput.value.trim();
    if (!metadataIpfsUrl) {
      mintOutputDiv.textContent = "⚠️ Please provide the IPFS URL of your metadata JSON.";
      return;
    }
    // Basic validation for IPFS URL (very simplistic)
    if (!metadataIpfsUrl.startsWith("ipfs://") && !metadataIpfsUrl.startsWith("https://")) {
        mintOutputDiv.textContent = "⚠️ Metadata URL should typically start with ipfs:// or a public gateway https://";
        // return; // Commenting out to allow user flexibility if they know what they're doing
    }


    mintOutputDiv.textContent = 🚀 Minting NFT... Please wait.;

    try {
      const toAddress = deployerAddress; // Mint to the deployer/connected wallet
      const tx = await deployedCollectionContract.safeMint(toAddress, metadataIpfsUrl);

      mintOutputDiv.textContent = ⏳ Waiting for minting transaction confirmation...\nTX Hash: ${tx.hash};
      await tx.wait(); // Wait for the transaction to be mined

      mintOutputDiv.textContent = ✅ NFT minted successfully!\nTX Hash: ${tx.hash};

      // Clear minting form fields (optional)
      nftNameInput.value = '';
      nftDescriptionInput.value = '';
      nftImageUrlInput.value = '';
      metadataJsonOutputTextarea.value = '';
      nftMetadataIpfsUrlInput.value = '';

      updateNextTokenIdDisplay(); // Refresh the next token ID

    } catch (err) {
      mintOutputDiv.textContent = ❌ Error minting NFT: ${err.message || err};
      console.error("Error during minting:", err);
    }
  });
}

