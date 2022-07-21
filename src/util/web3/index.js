import Web3 from "web3";
import store from "@/store";
import i18n from "@/i18n/i18n";
import tools from "@/util/tools.js"
import api from "@/api/index.js";
import * as zksync from "zksync";
import { ethers } from "ethers";
import { NFTStorage } from 'nft.storage';
// import { removeLocalStorage } from "@/util/local-storage.js"
const pinataSDK = require('@pinata/sdk');
const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );
  var myNfts = {};
  // const pinata = '';
  // const nftStorageClient = NFTStorage;
  var syncWallet = null;
  var syncProvider = '';
  var syncConnected = false;
  var name = 'aaa';
  var description= 'aaa';
  var image= '';
  // var ipfasHash='';
  // const imageURL= '';
  var notUpload= '';
  var externalURL= 'https://stackoverflow.com/';
  var recipientAddress= '';
  var verifiedETHBalance = 0;
  
  // const  loadingMessage= '';
  // $().ready( function() {
    console.log("nnnn");
    const imageURL = "../assets/placeholder.svg";
    const  pinata = pinataSDK('68c54f389e02c4759c98', '16ba8364657eec0102c1a3d8aadb12fcac148f254fc2684e01cd143ecad38e5d');
    const  nftStorageClient = new NFTStorage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDcxRjMxRTBEMDIxMkI3RjgyQ0MwM2E3ZThGOTYyMzU3OTU3Y0I1QmYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NjYwMzkyOTAwMywibmFtZSI6Im1pbm5mdCJ9.AjS2zKYLX2foZ81HNgfnc9pB0zbh6-TTAeDNGGf-PNw'});
    // const  isLoading = false;
// }); 

export default {
  // isLoading: 1,
  // loadingMessage: 'Uploading Data...',
  async connectWeb3() {
    var error = "";
    if (window.ethereum) {
      try {
        var web3 = new Web3(window.ethereum);
        window.wallet = web3;
        var coinbase = await promisify(cb => web3.eth.getCoinbase(cb));
        console.log('coinbase==',coinbase);
        var t = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('tttt==',t);
        if (!t) {
          error = "MetaMask enable Error";
          return { error };
        }
        if(coinbase === null){
          coinbase = await promisify(cb => web3.eth.getCoinbase(cb));
          
        }
        
        var networkId = await promisify(cb => web3.eth.getChainId(cb));
       

        window.ethereum.once("accountsChanged", this.accountsChanged);
        window.ethereum.on("chainChanged", this.chainChanged);
        window.ethereum.on("disconnect", this.disconnect);
        let walletType = 'metamask';
        if (syncWallet == null){
          this.zkConnect();
           }
        return { networkId, coinbase, walletType}
      } catch(e) {
        store.commit("PUSH_LOG", {
          name: "connectWeb3",
          projectName: "testOne",
          level: 3,
          content: JSON.stringify({
            message: e.message,
            stack: e.stack,
          }),
        });
        error = e.message;
      }
    } else {
      error = "MetaMask not Install";
    }
    return { error };
  },
  accountsChanged(accounts) {
    if(!store.state.connected) return;
    store.dispatch("logout")
    if(accounts.length){
      store.dispatch('connect');
    }
  },
  chainChanged(channelId) {
    let config = store.state.config;
    if (parseInt(channelId) != parseInt(config.networkId) ) {
      tools.messageBox(i18n.global.t('global.errNetwork'),
        i18n.global.t('global.changeNetworkTo') +
        tools.networkName(config.networkId));
    }
  },
  disconnect(error) {
    if(!store.state.connected) return;
    store.dispatch("logout");
  },
  async getTransaction(tx) {
    let web3 = this.getWeb3();
    try {
      // return await web3.eth.getTransaction(tx)
      return await promisify(cb => web3.eth.getTransaction(tx, cb));
    } catch (e) {
      return { error: e.message }
    }
  },
  async getTransactionReceipt(tx) {
    let web3 = this.getWeb3();
    try {
      return await promisify(cb => web3.eth.getTransactionReceipt(tx, cb));
    } catch (e) {
      return { error: e.message }
    }
  },
  async decodeLog(inputs, hexString, options){
    let web3 = this.getWeb3();
    try {
      return await promisify(cb => web3.eth.abi.decodeLog(inputs, hexString, options, cb));
    } catch (e) {
      return { error: e.message }
    }
  },
   hex2int(hex) {
    var len = hex.length, a = new Array(len), code;
    for (var i = 0; i < len; i++) {
        code = hex.charCodeAt(i);
        if (48<=code && code < 58) {
            code -= 48;
        } else {
            code = (code & 0xdf) - 65 + 10;
        }
        a[i] = code;
    }
    
    return a.reduce(function(acc, c) {
        acc = 16 * acc + c;
        return acc;
    }, 0);
},
  getWeb3() {
    return window.wallet;
  },
  async loginWallet(address) {
    let timestamp = parseInt(new Date().getTime()/1000);
    var message = store.state.nftm + " " + timestamp;
    console.log('message::',message);
    try {
      let signature = await this.sign(message, address);
      const syncProvider = await zksync.getDefaultProvider('mainnet');
    console.log('syncProvider::',syncProvider);
    const ethersProvider = ethers.getDefaultProvider('mainnet');
    // const amount = zksync.utils.closestPackableTransactionAmount(ethers.utils.parseEther('0.00001'));
    // const transfer = await syncWallet.syncTransfer({
    //   to: '0xC7C504a0aF007201F779aBa8A43Ea9bF55F81522',
    //   token: 'ETH',
    //   amount
    // });
    // console.log('transfer::',transfer);
//     const committedETHBalance = await syncWallet.getBalance('ETH');
//     // const ff = new BigNumber((committedETHBalance("ETH"))/1e18);
//     console.log('committedETHBalance::',committedETHBalance);
// // Verified state is final
// const verifiedETHBalance = parseInt(await (await syncWallet.getBalance('ETH', 'verified'))._hex, 16)/1e18;

// console.log('verifiedETHBalance::',verifiedETHBalance);
// const fee = await syncProvider.getTransactionFee('MintNFT', syncWallet.address(), 'ETH');
// console.log('fff::::',fee);
// const contentHash = '0xbd7289936758c562235a3a42ba2c4a56cbb23a263bb8f8d27aead80d74d9d996';
// const getNFT = await syncWallet.getNFT('449618','committed');
// console.log('getNFT::::',getNFT);

      return {
        signature: signature,
        timestamp: timestamp,
      }
    } catch (e) {
      return { error: e.message }
    }
  },
  
  async zkMint(_data) {
    console.log('syncWallet.isSigningKeySet()::',syncWallet.isSigningKeySet());
    syncWallet.isSigningKeySet().then(res => {
      console.log('res:::',res)});
    if (!syncWallet.isSigningKeySet()) {
      console.log('fffffff::::::');
      this.loadingMessage = "Activating Account..."
      if ((syncWallet.getAccountId()) !== undefined) {
        const changePubkey = await syncWallet.setSigningKey({
          feeToken: "ETH",
          ethAuthType: "ECDSA",
        });
        tools.messageBox(i18n.global.t(`
        Your transaction was submitted! Track it <a href=https://ropsten.zkscan.io/explorer/transactions/"${changePubkey.txHash.substring(8,)}">here</a>.
        `));
      }
    }
    store.state.setIsLoading(0);
    // store.state.setLoadingMessage('Uploading Data...');
    // this.isLoading = 1;
    while(image == ''){
    setTimeout(() => {
      console.log("B");
    }, 1000);
  };
    console.log("image;;;;;",image);
    const body = {
      "name": name,
      "image": image,
      "description": description,
      "external_url": externalURL
    }
    var ipf = '';
    const results = await pinata.pinJSONToIPFS(body).then(res => {
      console.log(res);
       ipf = res.IpfsHash});
    // const ipfsHash = results["IpfsHash"];
    console.log("body;;;;;",body);
    // console.log("results;;;;;",results);
    console.log("ipf;;;;;",ipf);
    var ipfsHash = Array.from(ipf);
    console.log("ipfsHash;;;;;",ipfsHash);
    const contentHash = await (await this.buf2hex(await this.fromB58(ipfsHash, "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"))).substring(4,);
    console.log('contentHash::',contentHash);
    store.state.setIsLoading(3);
    // store.state.setLoadingMessage = "Minting NFT..."
    // const contentHash = await (await this.buf2hex(await this.fromB58(ipfsHash, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'))).substring(4,);
    // const syncProvider = await zksync.getDefaultProvider('mainnet');
    // var web3 = new Web3(window.ethereum);
    // const ethWallet = new ethers.providers.Web3Provider(web3.currentProvider ).getSigner();
    
    // // const ethWallet = ethers.Wallet.fromMnemonic((await this.loginWallet(address)).signature).connect(ethersProvider);
    //  const syncWalle = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
     myNfts = await syncWallet.getAccountState();
     store.state.setmyNfts(myNfts.committed);
    console.log('myNfts:::::',myNfts);
    if (syncWallet == null){
      await this.zkConnect();
    }
    try{
    const nft = await syncWallet.mintNFT({
      recipient: syncWallet.address(),
      contentHash: "0x" + contentHash,
      feeToken: 'ETH'
    });
  }catch(e){
    console.log('ee::',e.message);
    tools.messageBox(i18n.global.t('global.errSignature'), e.message);
    
  }
   console.log('nfttttt::::',nft);
  //  console.log('txData::::',nft.txHash.substring(8,));
    store.state.setIsLoading(1);
    this.isLoading = 1;
    _data.address = syncWallet.address(),
    _data.tokenId = contentHash,
    _data.imgUrl = image,
    _data.txHash = nft.txHash.substring(8,)
    api("nft.add", _data).then(async function (res) {
      console.log('aaaaa',res);
    });
    // console.log('this.isLoading::',this.isLoading);
    // store.state.setLoadingMessage = "Minting Is Success"
  },
  async getnfturl(content){
    console.log('content::::',content);
    let baseNftData = {
      "name": "Name Unknown",
      "image": "https://i.imgur.com/nwZRdjr.png"
    };
            
    // Grab info from the syncProvider
    baseNftData["id"] = '';
    baseNftData["address"] = '';
    baseNftData["creatorAddress"] = '';
    baseNftData["contentHash"] = '';
    // Grab info from IPFS
    let contentHash = "1220" + content.substring(2,);
    let ipfsHash =  this.toB58( this.hex2huf(contentHash), '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
    var url = 'https://ipfs.io/ipfs/' + ipfsHash;
    var dataResponse = await fetch('https://ipfs.io/ipfs/' + ipfsHash);
      console.log('dataResponse',dataResponse);
      var nftData = await dataResponse.json();
      console.log('nftData:::',nftData);
      let link = nftData.image;
      // Parse as much information as possible
      // for (let k in nftData) {
      //   if (nftData[k] !== "") {
      //     baseNftData[k] = nftData[k];
      //     // Add https to URL if missing
      //     if (k === "image") {
      //      link = nftData[k];
      //       // link = (link.indexOf('://') === -1) ? 'https://' + link : link;
      //       // baseNftData[k] = link;
      //     }
      //   }
      // }
    return link;
  },
  async fromB58(S,A){
    console.log("a========");
    var d=[],b=[],i,j,c,n;
    for(i in S){j=0,c=A.indexOf(S[i]);
      if(c<0)return undefined;c||b.length^i?i:b.push(0);
      while(j in d||c){
        n=d[j];n=n?n*58+c:c;c=n>>8;d[j]=n%256;j++
      }}while(j--)b.push(d[j]);
   console.log("b========",b);
   return new Uint8Array(b)},
    toB58(B,A){var d=[],s="",i,j,c,n;for(i in B){j=0,c=B[i];s+=c||s.length^i?"":1;while(j in d||c){n=d[j];n=n?n*256+c:c;c=n/58|0;d[j]=n%58;j++}}while(j--)s+=A[d[j]];return s},
    hex2huf(hexString){
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  },
   async buf2hex(buffer) { // buffer is an ArrayBuffer
    // console.log("llll,,,,",new Uint8Array());
    return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
  },
  async zkConnect() {
    var web3 = new Web3(window.ethereum);
    const syncProvider = await zksync.getDefaultProvider('mainnet');
    const ethWallet = new ethers.providers.Web3Provider(web3.currentProvider ).getSigner();
    console.log('ethWallet::',ethWallet);
    // const ethWallet = ethers.Wallet.fromMnemonic((await this.loginWallet(address)).signature).connect(ethersProvider);
     syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);
      verifiedETHBalance = parseInt(await (await syncWallet.getBalance('ETH', 'verified'))._hex, 16)/1e18;
     console.log("syncWalletsyncWallet",syncWallet);
     myNfts = await syncWallet.getAccountState();
     store.state.setmyNfts(myNfts.committed);
    console.log('myNfts:::::',myNfts);
    var committed = myNfts.committed;
    var nfts= {};
     nfts = committed.nfts;
    console.log('myNfts:::::',nfts);
    console.log('nftsleng:::::',nfts.Promise);
    // for (const key in nfts) {
    //   console.log('bbbb:::::',key);
    //   if (nfts.hasOwnProperty(key)) {
    //     const element = nfts[key];
    //     console.log('element:::::',element);
    //     // for (let index = 0; index < nfts.length; index++) {
    //       console.log('aaa:::',element.contentHash);
    //       // const element = array[index];
    //       var uri =  this.getnfturl(element.contentHash).then(res => {
    //         console.log('uri:::',res);
    //         var _data = {
    //           address: '',
    //           storageId: '',
    //           imgUrl: '',
    //           quantity: '',
    //           tokenId: '',
    //           description: '',
    //           royalties: '',
    //           categoryId: '',
    //           properties: '',
    //           type: '',
    //           name: '',
    //           animUrl:'',
    //           animStorageId:'',
    //           txHash: ''
    //         };
    //         _data.address = syncWallet.address(),
    //       _data.tokenId = element.contentHash,
    //       _data.imgUrl = res,
    //       api("nft.add", _data).then(async function (res) {
    //         console.log('aaaaa',res);
    //       });
    //       });
          
    //     // }
    //   }
    // }
    
      
    
  },
  async loadData() {
    // console.log('llgllllllllllkkkk');
    // if (syncWallet == null){
    //   await this.zkConnect();
    // }
    // const verifiedETHBalance = parseInt(await (await syncWallet.getBalance('ETH', 'verified'))._hex, 16)/1e18;
  return verifiedETHBalance;
  },
  async sign(message, address) {
    var web3 = window.wallet;
    try {
      address = web3.utils.toChecksumAddress(address);
      var signature = await promisify( cb => web3.eth.personal.sign(message, address, cb));
      console.log('signature::',signature);
      // var signature = await web3.eth.personal.sign(message, address);
      return signature;
    } catch (e) {
      return { error: e.message }
    }
  },
  async checkWeb3(web3) {
    if (window.ethereum) {
      try {
        // var isListening = await web3.eth.net.isListening();
        // var isListening = await promisify(cb => web3.eth.net.isListening(cb))
        // if (!isListening) return false;
        return true;
      } catch {
      }
    }
    return false;
  },
  async monitorWeb3() {
    let web3 = window.wallet;
    if (typeof web3 == "undefined" || !web3) return;
    var result = await this.checkWeb3(web3);
    if (!result) {
      var result = await this.connectWeb3();
      if (result.error) return;
      web3 = window.wallet;
    }
    let config = store.state.config;

    var networkId = await promisify(cb => web3.eth.getChainId(cb));
    if (networkId != config.networkId) {
      tools.messageBox(i18n.global.t('global.errNetwork'),
        i18n.global.t('global.changeNetworkTo') + tools.networkName(config.networkId));
    }
  },
  async changeNetwork(network){
    try{
      let result = await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + network.channelId.toString(16) }],
      });
      return result;
    }catch(e){
      if(e.code == 4001) return { error: e.message  };
      try{
        let result = await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x" + network.channelId.toString(16),
            chainName: network.name,
            nativeCurrency:{
              name: network.coinSymbol,
              symbol: network.coinSymbol,
              decimals: 18,
            },
            rpcUrls: [ network.rpc ],
          }]
        });
        return result;
      }catch(e){
        return { error: e.message }
      }
    }
  },
  async uploadImage(file) {
    var event = event || window.event;
    var file = event.target.files[0];
    console.log('file',file);
    var ipfasHash = await nftStorageClient.storeBlob(file);
    console.log('ipfasHash',ipfasHash);
     image = 'https://ipfs.io/ipfs/' + ipfasHash;
    console.log('image',image);
  },
  setIsLoading (value) {
    this.isLoading = value
  },
}
