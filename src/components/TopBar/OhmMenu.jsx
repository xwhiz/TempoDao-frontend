import {useState, useEffect} from "react";
import {addresses, TOKEN_DECIMALS} from "../../constants";
import {getTokenImage} from "../../helpers";
import {useSelector} from "react-redux";
import {Link, SvgIcon, Popper, Button, Paper, Typography, Divider, Box, Fade, Slide} from "@material-ui/core";
import {ReactComponent as InfoIcon} from "../../assets/icons/info-fill.svg";
import {ReactComponent as ArrowUpIcon} from "../../assets/icons/arrow-up.svg";
import {ReactComponent as sOhmTokenImg} from "../../assets/tokens/token_sOHM.svg";
import {ReactComponent as ohmTokenImg} from "../../assets/tokens/token_OHM.svg";
import {ReactComponent as t33TokenImg} from "../../assets/tokens/token_33T.svg";
import tempoLogo from "../../assets/images/tempos.jpg";
import stempoLogo from "../../assets/images/stempo.jpg";

import "./ohmmenu.scss";
import {dai} from "src/helpers/AllBonds";
import {useWeb3Context} from "../../hooks/web3Context";

import OhmImg from "src/assets/tokens/token_OHM.svg";
import SOhmImg from "src/assets/tokens/token_sOHM.svg";
import token33tImg from "src/assets/tokens/token_33T.svg";

const addTokenToWallet = (tokenSymbol, tokenAddress) => async () => {
    if (window.ethereum) {
        const host = window.location.origin;
        // NOTE (appleseed): 33T token defaults to sOHM logo since we don't have a 33T logo yet
        let tokenPath;
        // if (tokenSymbol === "OHM") {

        // } ? OhmImg : SOhmImg;
        switch (tokenSymbol) {
            case "TEMPO":
            case "OHM":
                tokenPath = OhmImg;
                break;
            case "33T":
                tokenPath = token33tImg;
                break;
            default:
                tokenPath = SOhmImg;
        }
        const imageURL = `${host}/${tokenPath}`;

        try {
            await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: TOKEN_DECIMALS,
                        image: imageURL,
                    },
                },
            });
        } catch (error) {
            console.log(error);
        }
    }
};

function OhmMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const isEthereumAPIAvailable = window.ethereum;
    const {chainID} = useWeb3Context();

    const networkID = chainID;
    const SOHM_ADDRESS = addresses[networkID].SOHM_ADDRESS;
    const OHM_ADDRESS = addresses[networkID].OHM_ADDRESS;
    const PT_TOKEN_ADDRESS = addresses[networkID].PT_TOKEN_ADDRESS;

    const handleClick = event => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = "ohm-popper";
    const daiAddress = dai.getAddressForReserve(networkID);

    return (
        <>

            <Box
                component="div"
                onMouseEnter={e => handleClick(e)}
                onMouseLeave={e => handleClick(e)}
                id="ohm-menu-button-hover"
            >
                <Button id="ohm-menu-button" size="large" variant="contained" color="secondary" title="TEMPO"
                        aria-describedby={id} fullWidth >
                    <SvgIcon component={InfoIcon} color="primary"/>
                    <Typography>TEMPO</Typography>
                </Button>

                <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start" transition>
                    {({TransitionProps}) => {
                        return (
                            <Fade {...TransitionProps} timeout={100}>
                                <Paper className="ohm-menu" elevation={1}>

                                    {isEthereumAPIAvailable ? (
                                        <Box className="add-tokens">
                                            <p>ADD TOKEN TO WALLET</p>
                                            <Box display="flex" flexDirection="row" justifyContent="space-between">
                                                <Button variant="contained" color="secondary"
                                                        onClick={addTokenToWallet("TEMPO", OHM_ADDRESS)}>

													  <img src={tempoLogo} />

                                                    <Typography variant="body1">TEMPO</Typography>
                                                </Button>
                                                <Button variant="contained" color="secondary"
                                                        onClick={addTokenToWallet("sTEMPO", SOHM_ADDRESS)}>

													  <img src={stempoLogo} />

                                                    <Typography variant="body1">sTEMPO</Typography>
                                                </Button>
                                            </Box>
                                        </Box>
                                    ) : null}
                                </Paper>
                            </Fade>
                        );
                    }}
                </Popper>
            </Box>
        </>
    );
}

export default OhmMenu;
