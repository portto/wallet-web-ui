// this is an example config for mocking a real sdk user
// if you want to apply it to the mocking library,
// copy this file into config.js under the folder
const config = {
  email: "foo@bar.com",
  point: "10000",
  otp: "000000",
  two_factor: "000000",
  maintenance: false,
  custodial: true,
};
const WALLET_API_BASE = process.env.REACT_APP_API_BASE;

export default {
  gets: [
    {
      url: `${WALLET_API_BASE}/api/isUnderMaintenance`,
      response: { isUnderMaintenance: config.maintenance },
    },
    {
      url: `${WALLET_API_BASE}/blocto/account/getUserInfo`,
      response: {
        id: "ffffffff-5277-4bb9-bd57-e287a09a55ad",
        email: "foo@abx.xyz",
        type: config.custodial ? "normal" : "security",
        point: config.point,
        recovery_key: null,
        wallet_addresses: null,
        tutorial: { first_exp: false },
        name: null,
        recovery_limit_reached: null,
      },
    },
    {
      url: `${WALLET_API_BASE}/blocto/dapps/:id/info`,
      response: {
        id: "5d35c67e-7f37-4e4c-81ba-e7fafc92fd0a",
        name: "SDK Toolkit",
        blockchains: [
          "solana",
          "ethereum",
          "bsc",
          "flow",
          "aptos",
          "avalanche",
          "polygon",
        ],
        logo: "https://developer-dashboard-staging-logo.blocto.app/20221129T091020743Z161905.png",
        app_universal_links: "123123",
        app_package_name: "123123",
        web: {
          web_domain: "https://sdk-toolkit-dev.blocto.app",
          type: "Others",
          links: { website: "", twitter: "", discord: "", telegram: "" },
          contact: {
            name: "Yang",
            email: "dev@portto.io",
            job_title: "Frontend Lead",
          },
        },
      },
    },
    {
      url: `${WALLET_API_BASE}/blocto/account/assets`,
      response: {
        assets: [
          {
            id: "083f8d9d-d980-47f3-a6ee-f47cb4e1ac97",
            name: "Blocto Token",
            group: "BLT",
            blockchain: "ethereum",
            type: "erc20",
            status: "confirmed",
            value: "29654000000",
            wallet_address: "0xBCabBD427591ecaD6F01240f297170514c21A85d",
            contract_address: "0xfB0727386DB1A630344a08467b45541bEC9bCf17",
            symbol: "BLT",
            decimals: 8,
            is_manual: false,
            usd_price: "1.0001031038320018",
            pending_reason: "",
            background_color: "E2F3FF",
            color_icon:
              "https://raw.githubusercontent.com/portto/assets/main/color/bsc/blt.svg",
            white_icon:
              "https://raw.githubusercontent.com/portto/assets/main/white/bsc/blt.svg",
            chain_white_icon:
              "https://raw.githubusercontent.com/portto/assets/main/white/bsc/main.svg",
          },
          {
            id: "15bfd95f-3ed0-4361-b6c1-8bf972e8e349",
            name: "Ethereum",
            group: "ETH",
            blockchain: "ethereum",
            type: "native",
            status: "confirmed",
            value: "2126994864564427124",
            wallet_address: "0xdd22CbCE819faC81cb3E8d79D53df85A58e3a60f",
            contract_address: "",
            symbol: "ETH",
            decimals: 18,
            is_manual: false,
            usd_price: "1215.847912556641",
            pending_reason: "initializing",
            background_color: "C9CEF9",
            color_icon:
              "https://raw.githubusercontent.com/portto/assets/main/color/ethereum/main.svg",
            white_icon:
              "https://raw.githubusercontent.com/portto/assets/main/white/ethereum/main.svg",
            chain_white_icon:
              "https://raw.githubusercontent.com/portto/assets/main/white/ethereum/main.svg",
          },
        ],
        request_id: "24435c41",
      },
    },
  ],
  posts: [
    {
      url: `${WALLET_API_BASE}/api/authn-queue`,
      response: {
        queueId: "foo",
        queueNumber: 0,
        readyNumber: 0,
        time: 0,
      },
    },
    {
      url: `${WALLET_API_BASE}/blocto/account/checkEmailExist`,
      response: (req, res, ctx) =>
        res(ctx.json({ exist: req.body.email === config.email })),
    },
    {
      url: `${WALLET_API_BASE}/blocto/account/requestEmailAuth`,
      response: (req, res, ctx) =>
        res(ctx.json({ id: "ffffffff-ffff-ffff-8982-97f60db91fe7" })),
    },
    {
      url: `${WALLET_API_BASE}/blocto/account/login`,
      response: {
        jwt: "000000000000000000000000000000000000.eyJhY2Nlc3NfdG9rZW5faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJkYXBwX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiZGV2aWNlX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiZXhwIjoxNjcxNzA3NDE3LCJpbmZvIjoiOWZjMzQ3NDYtZTFhZC00NmI5LWI2OWMtN2IwNThmYmNlMWVmIiwic2NvcGVzIjpbIm5vcm1hbF9hY2NvdW50X2xvZ2luX2dyb3VwIl0sInNraXBfYWNjZXNzX3Rva2VuIjp0cnVlLCJ1c2VyX2lkIjoiZmQ5NmIxNWMtNTI3Ny00YmI5LWJkNTctZTI4N2EwOWE1NWFkIn0.rrpk1UJt30gDEZJQjtJS1-l7Z6HF-ZRcXokGpQB9tgdt0KFN5Tb7JZlMP6ygw2gH",
        challenge_id: "",
        challenge_msg: "",
      },
    },
    {
      url: `${WALLET_API_BASE}/blocto/account/acquireAccessToken`,
      response: {
        key: "000032beda35b26529c2219c056acffa296dde66d538af60f3c6900000000000",
        jwt: "000000000000000000000000000000000000.eyJhY2Nlc3NfdG9rZW5faWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJkYXBwX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiZGV2aWNlX2lkIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiZXhwIjoxNjcxNzA3NDE3LCJpbmZvIjoiOWZjMzQ3NDYtZTFhZC00NmI5LWI2OWMtN2IwNThmYmNlMWVmIiwic2NvcGVzIjpbIm5vcm1hbF9hY2NvdW50X2xvZ2luX2dyb3VwIl0sInNraXBfYWNjZXNzX3Rva2VuIjp0cnVlLCJ1c2VyX2lkIjoiZmQ5NmIxNWMtNTI3Ny00YmI5LWJkNTctZTI4N2EwOWE1NWFkIn0.rrpk1UJt30gDEZJQjtJS1-l7Z6HF-ZRcXokGpQB9tgdt0KFN5Tb7JZlMP6ygw2gH",
        need_check_device: false,
      },
    },
    {
      url: `${WALLET_API_BASE}/api/createHandshake`,
      response: {
        paddr: "0000a545ce3c552d",
        code: "fooobar",
        signatures: [],
      },
    },
  ],
};
