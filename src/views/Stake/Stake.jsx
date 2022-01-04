import {useEffect, useCallback, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    Link,
    OutlinedInput,
    Paper,
    Tab,
    Tabs,
    Typography,
    Zoom,
    Slider,
} from "@material-ui/core";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import {getOhmTokenImage, getTokenImage, trim} from "../../helpers";
import {changeApproval, changeStake} from "../../slices/StakeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./calc.scss";
import "./stake.scss";
import {useWeb3Context} from "src/hooks/web3Context";
import {isPendingTxn, txnButtonText} from "src/slices/PendingTxnsSlice";
import {Skeleton} from "@material-ui/lab";
// import ExternalStakePool from "./ExternalStakePool";
import {error} from "../../slices/MessagesSlice";
import {ethers} from "ethers";

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const sOhmImg = getTokenImage("sohm");
const ohmImg = getOhmTokenImage(16, 16);

function Stake() {
    const dispatch = useDispatch();
    const {provider, address, connected, connect, chainID} = useWeb3Context();

    const [zoomed, setZoomed] = useState(false);
    const [view, setView] = useState(0);
    const [quantity, setQuantity] = useState("");

    const isAppLoading = useSelector(state => state.app.loading);
    const currentIndex = useSelector(state => {
        return state.app.currentIndex;
    });
    const fiveDayRate = useSelector(state => {
        return state.app.fiveDayRate;
    });
    const ohmBalance = useSelector(state => {
        return state.account.balances && state.account.balances.ohm;
    });
    const oldSohmBalance = useSelector(state => {
        return state.account.balances && state.account.balances.oldsohm;
    });
    const sohmBalance = useSelector(state => {
        return state.account.balances && state.account.balances.sohm;
    });
    const warmupBalance = useSelector(state => {
        return state.account.balances && state.account.balances.warmupOhm;
    });
    const fsohmBalance = useSelector(state => {
        return state.account.balances && state.account.balances.fsohm;
    });
    const wsohmBalance = useSelector(state => {
        return state.account.balances && state.account.balances.wsohm;
    });
    const stakeAllowance = useSelector(state => {
        return state.account.staking && state.account.staking.ohmStake;
    });
    const unstakeAllowance = useSelector(state => {
        return state.account.staking && state.account.staking.ohmUnstake;
    });
    const stakingRebase = useSelector(state => {
        return state.app.stakingRebase;
    });
    const stakingAPY = useSelector(state => {
        return state.app.stakingAPY;
    });
    const stakingTVL = useSelector(state => {
        return state.app.stakingTVL;
    });

    const pendingTransactions = useSelector(state => {
        return state.pendingTransactions;
    });

    const setMax = () => {
        if (view === 0) {
            setQuantity(ohmBalance);
        } else {
            setQuantity(sohmBalance);
        }
    };

    const onSeekApproval = async token => {
        await dispatch(changeApproval({address, token, provider, networkID: chainID}));
    };

    const onChangeStake = async action => {
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(quantity) || quantity === 0 || quantity === "") {
            // eslint-disable-next-line no-alert
            return dispatch(error("Please enter a value!"));
        }

        // 1st catch if quantity > balance
        let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
        if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
            return dispatch(error("You cannot stake more than your TEMPO balance."));
        }

        if (action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(sohmBalance, "gwei"))) {
            return dispatch(error("You cannot unstake more than your sTEMPO balance."));
        }

        await dispatch(changeStake({address, action, value: quantity.toString(), provider, networkID: chainID}));
    };

    const hasAllowance = useCallback(
        token => {
            if (token === "ohm") return stakeAllowance > 0;
            if (token === "sohm") return unstakeAllowance > 0;
            return 0;
        },
        [stakeAllowance, unstakeAllowance],
    );

    const isAllowanceDataLoading = (stakeAllowance == null && view === 0) || (unstakeAllowance == null && view === 1);

    let modalButton = [];

    modalButton.push(
        <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
            Connect Wallet
        </Button>,
    );

    const changeView = (event, newView) => {
        setView(newView);
    };

    const trimmedBalance = Number(
        [sohmBalance, fsohmBalance, wsohmBalance]
            .filter(Boolean)
            .map(balance => Number(balance))
            .reduce((a, b) => a + b, 0)
            .toFixed(4),
    );

    const trimmedStakingAPY = trim(stakingAPY * 100, 1);
    const stakingRebasePercentage = trim(stakingRebase * 100, 4);
    const nextRewardValue = trim((stakingRebasePercentage / 100) * trimmedBalance, 4);

    const marketPrice = useSelector(state => {
        return state.app.marketPrice;
      });

  const trimmedMemoBalance = trim(Number(sohmBalance), 6);
  const trimeMarketPrice = trim(marketPrice, 2);

  const [memoAmount, setMemoAmount] = useState(trimmedMemoBalance);
  const [rewardYield, setRewardYield] = useState(trimmedStakingAPY);
  const [priceAtPurchase, setPriceAtPurchase] = useState(trimeMarketPrice);
  const [futureMarketPrice, setFutureMarketPrice] = useState(trimeMarketPrice);
  const [days, setDays] = useState(30);

  const [rewardsEstimation, setRewardsEstimation] = useState("0");
  const [potentialReturn, setPotentialReturn] = useState("0");

  const calcInitialInvestment = () => {
      const memo = Number(memoAmount) || 0;
      const price = parseFloat(priceAtPurchase) || 0;
      const amount = memo * price;
      return trim(amount, 2);
  };

  const calcCurrentWealth = () => {
      const memo = Number(memoAmount) || 0;
      const price = parseFloat(trimeMarketPrice);
      const amount = memo * price;
      return trim(amount, 2);
  };

  const [initialInvestment, setInitialInvestment] = useState(calcInitialInvestment());

  useEffect(() => {
      const newInitialInvestment = calcInitialInvestment();
      setInitialInvestment(newInitialInvestment);
  }, [memoAmount, priceAtPurchase]);

  const calcNewBalance = () => {
      let value = parseFloat(rewardYield) / 100;
      value = Math.pow(value - 1, 1 / (365 * 3)) - 1 || 0;
      let balance = Number(memoAmount);
      for (let i = 0; i < days * 3; i++) {
          balance += balance * value;
      }
      return balance;
  };

  useEffect(() => {
      const newBalance = calcNewBalance();
      setRewardsEstimation(trim(newBalance, 6));
      const newPotentialReturn = newBalance * (parseFloat(futureMarketPrice) || 0);
      setPotentialReturn(trim(newPotentialReturn, 2));
  }, [days, rewardYield, futureMarketPrice, memoAmount]);



    return (
        <div id="stake-view">
            <Zoom in={true} onEntered={() => setZoomed(true)}>
                <Paper className={`ohm-card`}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <div className="card-header">
                                <Typography variant="h5">Single Stake (⌛, ⌛)</Typography>
                                <RebaseTimer/>
                            </div>
                        </Grid>

                        <Grid item>
                            <div className="stake-top-metrics">
                                <Grid container spacing={2} alignItems="flex-end">
                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                        <div className="stake-apy">
                                            <Typography variant="h5" color="textSecondary">
                                                APY
                                            </Typography>
                                            <Typography variant="h4">
                                                {stakingAPY ? (
                                                    <>{new Intl.NumberFormat("en-US").format(trimmedStakingAPY)}%</>
                                                ) : (
                                                    <Skeleton width="150px"/>
                                                )}
                                            </Typography>
                                        </div>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                        <div className="stake-index">
                                            <Typography variant="h5" color="textSecondary">
                                                Current Index
                                            </Typography>
                                            <Typography variant="h4">
                                                {currentIndex ? <>{trim(currentIndex, 1)} TEMPO</> :
                                                    <Skeleton width="150px"/>}
                                            </Typography>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </Grid>

                        <div className="staking-area">
                            {!address ? (
                                <div className="stake-wallet-notification">
                                    <div className="wallet-menu" id="wallet-menu">
                                        {modalButton}
                                    </div>
                                    <Typography variant="h6">Connect your wallet to stake </Typography>
                                </div>
                            ) : (
                                <>
                                    <Box className="stake-action-area">
                                        <Tabs
                                            key={String(zoomed)}
                                            centered
                                            value={view}
                                            textColor="primary"
                                            indicatorColor="primary"
                                            className="stake-tab-buttons"
                                            onChange={changeView}
                                            aria-label="stake tabs"
                                        >
                                            <Tab label="Stake" {...a11yProps(0)} />
                                            <Tab label="Unstake" {...a11yProps(1)} />
                                        </Tabs>

                                        <Box className="stake-action-row " display="flex" alignItems="center">
                                            {address && !isAllowanceDataLoading ? (
                                                (!hasAllowance("ohm") && view === 0) || (!hasAllowance("sohm") && view === 1) ? (
                                                    <Box className="help-text">
                                                        <Typography variant="body1" className="stake-note"
                                                                    color="textSecondary">
                                                            {view === 0 ? (
                                                                <>
                                                                    First time staking <b>TEMPO</b>?
                                                                    <br/>
                                                                    Please approve Tempo DAO to use
                                                                    your <b>TEMPO</b> for staking.
                                                                </>
                                                            ) : (
                                                                <>
                                                                    First time unstaking <b>sTEMPO</b>?
                                                                    <br/>
                                                                    Please approve Tempo DAO to use
                                                                    your <b>sTEMPO</b> for unstaking.
                                                                </>
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <FormControl className="ohm-input" variant="outlined"
                                                                 color="primary">
                                                        <InputLabel htmlFor="amount-input"></InputLabel>
                                                        <OutlinedInput
                                                            id="amount-input"
                                                            type="number"
                                                            placeholder="Enter an amount"
                                                            className="stake-input"
                                                            value={quantity}
                                                            onChange={e => setQuantity(e.target.value)}
                                                            labelWidth={0}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <Button variant="text" onClick={setMax}
                                                                            color="inherit">
                                                                        Max
                                                                    </Button>
                                                                </InputAdornment>
                                                            }
                                                        />
                                                    </FormControl>
                                                )
                                            ) : (
                                                <Skeleton width="150px"/>
                                            )}

                                            <TabPanel value={view} index={0} className="stake-tab-panel">
                                                {isAllowanceDataLoading ? (
                                                    <Skeleton/>
                                                ) : address && hasAllowance("ohm") ? (
                                                    <Button
                                                        className="stake-button"
                                                        variant="contained"
                                                        color="primary"
                                                        disabled={isPendingTxn(pendingTransactions, "staking")}
                                                        onClick={() => {
                                                            onChangeStake("stake");
                                                        }}
                                                    >
                                                        {txnButtonText(pendingTransactions, "staking", "Stake TEMPO")}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="stake-button"
                                                        variant="contained"
                                                        color="primary"
                                                        disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                                                        onClick={() => {
                                                            onSeekApproval("ohm");
                                                        }}
                                                    >
                                                        {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                                                    </Button>
                                                )}
                                            </TabPanel>
                                            <TabPanel value={view} index={1} className="stake-tab-panel">
                                                {isAllowanceDataLoading ? (
                                                    <Skeleton/>
                                                ) : address && hasAllowance("sohm") ? (
                                                    <Button
                                                        className="stake-button"
                                                        variant="contained"
                                                        color="primary"
                                                        disabled={isPendingTxn(pendingTransactions, "unstaking")}
                                                        onClick={() => {
                                                            onChangeStake("unstake");
                                                        }}
                                                    >
                                                        {txnButtonText(pendingTransactions, "unstaking", "Unstake TEMPO")}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="stake-button"
                                                        variant="contained"
                                                        color="primary"
                                                        disabled={isPendingTxn(pendingTransactions, "approve_unstaking")}
                                                        onClick={() => {
                                                            onSeekApproval("sohm");
                                                        }}
                                                    >
                                                        {txnButtonText(pendingTransactions, "approve_unstaking", "Approve")}
                                                    </Button>
                                                )}
                                            </TabPanel>
                                            
                                        </Box>
                                    </Box>

                                    <div className={`stake-user-data`}>
                                        <div className="data-row">
                                            <Typography variant="body1">Your Balance</Typography>
                                            <Typography variant="body1">
                                                {isAppLoading ?
                                                    <Skeleton width="80px"/> : <>{trim(ohmBalance, 4)} TEMPO</>}
                                            </Typography>
                                        </div>

                                        <div className="data-row">
                                            <Typography variant="body1">Your Warmup Balance (2 epochs)</Typography>
                                            <Typography variant="body1">
                                                {isAppLoading ?
                                                    <Skeleton width="80px"/> : <>{trim(warmupBalance, 4)} sTEMPO</>}
                                            </Typography>
                                        </div>

                                        <div className="data-row">
                                            <Typography variant="body1">Your Staked Balance</Typography>
                                            <Typography variant="body1">
                                                {isAppLoading ? <Skeleton width="80px"/> : <>{trimmedBalance} sTEMPO</>}
                                            </Typography>
                                        </div>

                                        <div className="data-row">
                                            <Typography variant="body1">Next Reward Amount</Typography>
                                            <Typography variant="body1">
                                                {isAppLoading ? <Skeleton width="80px"/> : <>{nextRewardValue} sTEMPO</>}
                                            </Typography>
                                        </div>

                                        <div className="data-row">
                                            <Typography variant="body1">Next Reward Yield</Typography>
                                            <Typography variant="body1">
                                                {isAppLoading ?
                                                    <Skeleton width="80px"/> : <>{stakingRebasePercentage}%</>}
                                            </Typography>
                                        </div>

                                        <div className="data-row">
                                            <Typography variant="body1">ROI (5-Day Rate)</Typography>
                                            <Typography variant="body1">
                                                {isAppLoading ?
                                                    <Skeleton width="80px"/> : <>{trim(fiveDayRate * 100, 4)}%</>}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Box className="help-text">
                                                        <Typography variant="body1" className="stake-note"
                                                                    color="textSecondary">
                                                                <>
                                                                    Note: There is a 2 epoch warm-up staking period, where users must be staked for more than 2 epochs before claiming their funds. Users will accumulate rewards while in the warm-up period but will not be able to claim them for 2 epochs. When 2 epochs have elapsed your warmup balance can be claimed from the warmup contract to your wallet and receive the rebase rewards continuously. (1 epoch = 16 hours)
                                                                </>
                                                        </Typography>
                                                        <Typography variant="body1" className="stake-note">
                                                            <a style={{textDecoration: 'none'}, {color: 'white'}} href="https://snowtrace.io/address/0x6323c227f71b30babdd6fe84093027079a955662#writeContract">Contract</a>

                                                        </Typography>

                                        </Box>
                                </>
                            )}
                        </div>
                    </Grid>
                </Paper>
            </Zoom>

            <Zoom in={true}>
                <div className="calculator-card">
                    <Grid className="calculator-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="calculator-card-header">
                                <p className="calculator-card-header-title">Calculator</p>
                                <p className="calculator-card-header-subtitle">Estimate your returns</p>
                            </div>
                        </Grid>
                        
                        <div className="calculator-card-area">
                            <div>
                                <div className="calculator-card-action-area">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">sTempo Amount</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={memoAmount}
                                                    onChange={e => setMemoAmount(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setMemoAmount(trimmedMemoBalance)} className="stake-card-action-input-btn">
                                                                <p>Max</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">APY (%)</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={rewardYield}
                                                    onChange={e => setRewardYield(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setRewardYield(trimmedStakingAPY)} className="stake-card-action-input-btn">
                                                                <p>Current</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">Tempo price at purchase ($)</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={priceAtPurchase}
                                                    onChange={e => setPriceAtPurchase(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setPriceAtPurchase(trimeMarketPrice)} className="stake-card-action-input-btn">
                                                                <p>Current</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">Future Tempo market price ($)</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={futureMarketPrice}
                                                    onChange={e => setFutureMarketPrice(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setFutureMarketPrice(trimeMarketPrice)} className="stake-card-action-input-btn">
                                                                <p>Current</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </div>
                                <div className="calculator-days-slider-wrap">
                                    <p className="calculator-days-slider-wrap-title">{`${days} day${days > 1 ? "s" : ""}`}</p>
                                    <Slider className="calculator-days-slider" min={1} max={365} value={days} onChange={(e, newValue: any) => setDays(newValue)} />
                                </div>
                                <div className="calculator-user-data">
                                    <div className="data-row">
                                        <p className="data-row-name">Your initial investment</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>${initialInvestment}</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">Current wealth</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>${calcCurrentWealth()}</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">Tempo rewards estimation</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{rewardsEstimation} Tempo</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">Potential return</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>${potentialReturn}</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">Potential number of 2022 Toyota Prius ($24,525)</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{Number(potentialReturn) / 24525}</>}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid>
                </div>
            </Zoom>

            {/* <ExternalStakePool /> */}
        </div>
    );
}

export default Stake;
