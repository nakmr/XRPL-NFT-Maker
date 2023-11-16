import { Button } from "@mui/material";
import { Xumm } from "xumm";
import "./index.css";
import { useState, useEffect } from "react";

// require('Dotenv').config()

const API_KEY = process.env.XUMM_API_KEY

const xumm = new Xumm(API_KEY)

export const NftMinter = () => {
  const [account, setAccount] = useState(undefined)
  const [file, setFile] = useState(undefined)

  useEffect(() => {
    xumm.on('success', async () => {
      setAccount(await xumm.user.account)
    })
  }, [])

  const connect = () => {
    xumm.authorize()
  }

  const uploadImage = (e) => {
    console.log("evnet", e)
    const files = e.target.files
    setFile(files[0])
  }

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
      {file && <img src={window.URL.createObjectURL(file)} alt="nft" className="nft-image" />}
    </div>
  );
}
