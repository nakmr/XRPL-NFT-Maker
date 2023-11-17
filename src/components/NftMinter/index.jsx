import { Button } from "@mui/material";
import { Xumm } from "xumm";
import "./index.css";
import { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { XrplClient } from 'xrpl-client'
import { NFTStorage } from "nft.storage";

// require('Dotenv').config()

const API_KEY = '3ac3d18a-9162-4394-94a1-1097e4a8d0e8'
const STORAGE_API_KEY = process.env.STORAGE_API_KEY

const xumm = new Xumm(API_KEY);
const nftStorage = new NFTStorage({ token: STORAGE_API_KEY });

export const NftMinter = () => {
  const [account, setAccount] = useState(undefined);
  const [file, setFile] = useState(undefined);

  useEffect(() => {
    xumm.on("success", async () => {
      setAccount(await xumm.user.account);
    });
  }, []);

  const connect = () => {
    xumm.authorize();
  };

  const uploadImage = (e) => {
    const files = e.target.files;
    setFile(files[0])
  };

  const mint = async () => {
    if (!file) {
      alert("画像ファイルを選択してください！");
      return;
    }
    const { url } = await nftStorage.store({
      schema: "ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU",
      nftType: "art.v0",
      image: file,
      name: "some name",
      description: "some description",
    });
    const payload = await xumm.payload.createAndSubscribe({
      TransactionType: "NFTokenMint",
      NFTokenTaxon: 0,
      Flags: 8,
      URI: Buffer.from(url).toString("hex"),
    });
    payload.websocket.onmessage = (msg) => {
      const data = JSON.parse(msg.data.toString());
      if (typeof data.signed === "boolean") {
        payload.resolve({ signed: data.signed, txid: data.txid });
      }
    };
    const { signed, txid } = await payload.resolved;
    if (!signed) {
      alert("トランザクションへの署名は拒否されました！");
      return;
    }
    const client = new XrplClient("wss://testnet.xrpl-labs.com");
    const txResponse = await client.send({
      command: "tx",
      transaction: txid,
    });
    const nftokenId = txResponse.meta.nftoken_id
    alert("NFTトークンが発行されました！");
    window.open(`https://test.bithomp.com/nft/${nftokenId}`, "_blank");
  };

  return (
    <div className="nft-minter-box">
      <div className="title">XRP NFT</div>
      <div className="account-box">
        <div className="account">{account}</div>
        <Button variant="contained" onClick={connect}>
          connect
        </Button>
      </div>
      <div className="image-box">
        <Button variant="contained" onChange={uploadImage}>
          ファイルを選択
          <input
            className="imageInput"
            type="file"
            accept=".jpg , .jpeg , .png"
          />
        </Button>
      </div>
      {file && (
          <img
            src={window.URL.createObjectURL(file)}
            alt="nft"
            className="nft-image"
          />
      )}
      {account && (
        <div>
          <Button variant="outlined" onClick={mint}>
            mint
          </Button>
        </div>
      )}
    </div>
  );
};

// const xumm = new Xumm(API_KEY)
// const nftStorage = new NFTStorage({ token: STORAGE_API_KEY,});

// export const NftMinter = () => {
//   const [account, setAccount] = useState(undefined)
//   const [file, setFile] = useState(undefined)

//   useEffect(() => {
//     xumm.on('success', async () => {
//       setAccount(await xumm.user.account)
//     })
//   }, [])

//   const connect = () => {
//     xumm.authorize()
//   }

//   const uploadImage = (e) => {
//     console.log("evnet", e)
//     const files = e.target.files
//     setFile(files[0])
//   }

//   const mint = async () => {
//     console.log("mint")
//     if (!file) {
//       alert("Plsease select image")
//       return
//     }
//     // Upload image and metadata to IPFS
//     const { url } = await nftStorage.store({
//       schema: "ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU",
//       nftType: "art.v0",
//       image: file,
//       name: "an image",
//       description: "This is an image"
//     })
//     console.log("url", url)
//     // Send transaction to Xumm
//     const payload = await xumm.payload.createAndSubscribe({
//       TransactionType: "NFTokenMint",
//       NFTokenTaxon: 0,
//       Flags: 8,
//       URI: Buffer.from(url).toString("hex"),
//     })
//     console.log("payload", payload)
//     payload.websocket.onmessage = (msg) => {
//       const data = JSON.parse(msg.data.toString())
//       console.log("data", data)
//       // Check if transaction is validated
//       if (typeof data.signed === "boolean") {
//         payload.resolve({ signed: data.signed, txid: data.txid })
//       }
//     }
//     // Wait for transaction to be validated
//     const { signed, txid } = await payload.resolved
//     if (!signed) {
//       alert("Transaction not signed")
//       return
//     }
//     console.log("txid", txid)
//     // Get trancaction details from testnet
//     const client = new XrplClient("wss://testnet.xrpl-labs.com")
//     console.log("client", client)
//     const txResponse = await client.setnd({
//       command: "tx",
//       transaction: txid,
//     })
//     console.log("txResponse", txResponse)
//     // Get NFT data from transaction
//     const nftokenId = txResponse.meta.nftoken_id
//     alert(`NFT minted with ${nftokenId}`)
//     window.open(`https://test.bithomp.com/nft/${nftokenId}`, "_blank")
//   }  

//   return (
//     <div className="nft-minter-box">
//       <div className="title">XRP NFT</div>
//         <div className="account-box">
//           <div className="account">{account}</div>
//             <Button variant="contained" onClick={connect}>
//               connect
//             </Button>
//         </div>
//       <div className="image-box">
//         <Button variant="contained" onChange={uploadImage}>
//           ファイルを選択
//           <input
//             className="imageInput"
//             type="file"
//             accept=".jpg , .jpeg , .png"
//           />
//         </Button>
//       </div>
//       {file && (
//           <img
//             src={window.URL.createObjectURL(file)}
//             alt="nft"
//             className="nft-image"
//           />
//       )}
//       {account && (
//         <div>
//           <Button variant="outlined" onClick={mint}>
//             mint
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
