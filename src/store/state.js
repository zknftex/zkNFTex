import settings from '@/settings';

export default {
  nftm: "Welcome. Login zkNFTex Market. This is completely secure and doesn't cost anything! ",
  myNfts: {},
  isLoading: 0,
  loadingMessage: 'Uploading Data...',
  loadingMessage2: 'Minting NFT...',
  loadingMessage3: 'Success',
  webLoading: false,
  currentRoute: null,
  currentView: null,
  token: null,
  connected: false,
  isLogin: false,
  heartbeatTimer: null,
  notice_unread: 0,
  config: {
    buyerFee: 0,
    ipfsUrl: "",
    networkId: "",
    sellerFee: "",
  },
  web3: {
    address: null,
    coinbase: null,
    error: null,
    instance: null,
    isInjected: false,
    walletType: "",
    networkId: null
  },
  ethBalance: '0',
  erc20Balance: {},
  user: {
    coinbase: "",
    avatar: "",
    brief: "",
    nickname: "",
    shortUrl: "",
    loginType: "",
    bannerUrl:"",
    id:"",
  },
  payTokens: [],
  defalutPayToken: null,
  categorys: [],
  logs: [],
  logTimer: null,
  ...settings,
  setIsLoading (value) {
    this.isLoading = value
  },
  setLoadingMessage (value) {
    this.loadingMessage = value
  },
  setmyNfts (value) {
    this.myNfts = value
  },
};
