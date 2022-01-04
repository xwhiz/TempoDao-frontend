import { useEffect, useState } from "react";
import { Paper, Typography, Box, Container, useMediaQuery} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import Chart from "../../components/Chart/Chart.jsx";
import { trim, formatCurrency } from "../../helpers";

import {
  treasuryDataQuery,
  rebasesDataQuery,
  bulletpoints,
  tooltipItems,
  tooltipInfoMessages,
  itemType,
} from "./treasuryData.js";
import { useTheme } from "@material-ui/core/styles";
import "./treasury-dashboard.scss";
import apollo from "../../lib/apolloClient";
import InfoTooltip from "src/components/InfoTooltip/InfoTooltip.jsx";
import { allBondsMap } from "src/helpers/AllBonds";

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState(null);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply = useSelector(state => {
    return state.app.circSupply;
  });
  const totalSupply = useSelector(state => {
    return state.app.totalSupply;
  });
  const marketCap = useSelector(state => {
    return state.app.marketCap;
  });

  const stakingAPY = useSelector(state => {
    return state.app.stakingAPY;
  });
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const backingPerOhm = useSelector(state => {
    return state.app.treasuryMarketValue;
  });

  const wsOhmPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  }); 

  const treasuryBalance = useSelector(state => {
    if (state.bonding.loading == false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances;
    }
  });

  useEffect(() => {
    apollo(treasuryDataQuery).then(r => {
      let metrics = r.data.protocolMetrics.map(entry =>
        Object.entries(entry).reduce((obj, [key, value]) => ((obj[key] = parseFloat(value)), obj), {}),
      );
      metrics = metrics.filter(pm => pm.treasuryMarketValue > 0);
      setData(metrics);

      let staked = r.data.protocolMetrics.map(entry => ({
        staked: (parseFloat(entry.sOhmCirculatingSupply) / parseFloat(entry.ohmCirculatingSupply)) * 100,
        timestamp: entry.timestamp,
      }));
      staked = staked.filter(pm => pm.staked < 100);
      setStaked(staked);

      let runway = metrics.filter(pm => pm.runway10k > 5);
      setRunway(runway);
    });

    apollo(rebasesDataQuery).then(r => {
      let apy = r.data.rebases.map(entry => ({
        apy: Math.pow(parseFloat(entry.percentage) + 1, 365 * 1.5) * 100,
        timestamp: entry.timestamp,
      }));

      apy = apy.filter(pm => pm.apy < 300000);

      setApy(apy);
    });
  }, []);

  
  return (
    <div id="treasury-dashboard-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "3.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Box className={`hero-metrics`}>
          <Paper className="ohm-card">
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center">
              <Box className="metric market">
                <Typography variant="h6" color="textSecondary">
                  Market Cap
                </Typography>
                <Typography variant="h5">
                  { marketCap && formatCurrency(marketCap, 0)}
                  {!marketCap && <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric price">
                <Typography variant="h6" color="textSecondary">
                  TEMPO Price
                </Typography>
                <Typography variant="h5">
                  {/* appleseed-fix */}
                  {marketPrice ? formatCurrency(marketPrice, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric wsoprice">
                <Typography variant="h6" color="textSecondary">
                  wsTEMPO Price
                  <InfoTooltip
                    message={
                      "wsTEMPO = sTEMPO * index\n\nThe price of wsTEMPO is equal to the price of TEMPO multiplied by the current index"
                    }
                  />
                </Typography>

                <Typography variant="h5">
                  {wsOhmPrice ? formatCurrency(wsOhmPrice, 2) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric circ">
                <Typography variant="h6" color="textSecondary">
                  Circulating Supply (total)
                </Typography>
                <Typography variant="h5">
                  {circSupply && totalSupply ? (
                    parseInt(circSupply) + " / " + parseInt(totalSupply)
                  ) : (
                    <Skeleton type="text" />
                  )}
                </Typography>
              </Box>

              <Box className="metric index">
                <Typography variant="h6" color="textSecondary">
                  APY
                </Typography>
                <Typography variant="h5">
                  {stakingAPY ? new Intl.NumberFormat("en-US").format(trim(stakingAPY * 100, 1)) + "%" : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric index">
                <Typography variant="h6" color="textSecondary">
                  Current Index
                  <InfoTooltip
                    message={
                      "The current index tracks the amount of sTEMPO accumulated since the beginning of staking. Basically, how much sTEMPO one would have if they staked and held a single TEMPO from day 1."
                    }
                  />
                </Typography>
                <Typography variant="h5">
                  {currentIndex ? trim(currentIndex, 2) + " sTEMPO" : <Skeleton type="text" />}
                </Typography>
              </Box>
             

              <Box className="metric bpo">
                <Typography variant="h6" color="textSecondary">
                  TVL
                </Typography>
                <Typography variant="h5">
                {marketPrice && circSupply ?  new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    }).format(marketPrice*circSupply) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric bpo">
                <Typography variant="h6" color="textSecondary">
                  Backing per TEMPO
                </Typography>
                <Typography variant="h5">
                  {treasuryBalance && circSupply ?  new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    }).format(treasuryBalance/circSupply) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric bpo">
                <Typography variant="h6" color="textSecondary">
                Treasury Balance
                </Typography>
                <Typography variant="h5">
                  {treasuryBalance && circSupply ?  new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    }).format(treasuryBalance) : <Skeleton type="text" />}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>


      </Container>
      

    </div>
  );
}

export default TreasuryDashboard;
