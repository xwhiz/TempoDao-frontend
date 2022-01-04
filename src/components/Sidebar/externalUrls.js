import { ReactComponent as ForumIcon } from "../../assets/icons/forum.svg";
import { ReactComponent as GovIcon } from "../../assets/icons/governance.svg";
import { ReactComponent as DocsIcon } from "../../assets/icons/docs.svg";
import { ReactComponent as FeedbackIcon } from "../../assets/icons/feedback.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/feedback.svg";
import { SvgIcon } from "@material-ui/core";

const externalUrls = [

  {
    title: "Governance",
    url: "https://snapshot.org/#/tempodao.eth",
    icon: <SvgIcon color="primary" component={GovIcon} />,
  },
  {
    title: "Buy in Traderjoe",
    url: "https://tinyurl.com/tempodaobuy",
    icon: <SvgIcon color="primary" component={ArrowUpIcon} />,
  },
  /*{
    title: "Feedback",
    url: "https://olympusdao.canny.io/",
    icon: <SvgIcon color="primary" component={FeedbackIcon} />,
  },*/
];

export default externalUrls;
