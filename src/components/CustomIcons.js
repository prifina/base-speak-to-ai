import { GenIcon } from "react-icons";

export const ProfileIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      viewBox: "0 0 20 20",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "path",
        attr: {
          d: "M8 19H3C1.89543 19 1 18.1046 1 17V10.2969C1 9.78521 1.19615 9.29295 1.54809 8.92146L8.54809 1.53257C9.33695 0.699887 10.663 0.699886 11.4519 1.53257L18.4519 8.92146C18.8038 9.29295 19 9.78521 19 10.2969V17C19 18.1046 18.1046 19 17 19H12M8 19V13.5C8 13.2239 8.22386 13 8.5 13H11.5C11.7761 13 12 13.2239 12 13.5V19M8 19H12",
          // stroke: "#6C757D",
          strokeWidth: "1.5",
        },
        child: [],
      },
    ],
  })({ ...props });
};

export const KnowledgeBaseIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "path",
        attr: {
          d: "M3 10V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V10M3 10L4.58555 4.45056C4.83087 3.59196 5.61564 3 6.5086 3H12M3 10H12M21 10L19.4144 4.45056C19.1691 3.59195 18.3844 3 17.4914 3H12M21 10H12M12 3V10",
          // stroke: "#7C7C7C",
          strokeWidth: "1.5",
        },
        child: [],
      },
      {
        tag: "path",
        attr: {
          d: "M5.5 17.5H12",
          // stroke: "#7C7C7C",
          strokeWidth: "1.5",
          strokeLinecap: "round",
        },
        child: [],
      },
    ],
  })({ ...props });
};

export const InsightsIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "rect",
        attr: {
          x: "3",
          y: "3",
          width: "18",
          height: "18",
          rx: "2",
          // stroke: "#1F1F22",
          strokeWidth: "1.5",
        },
        child: [],
      },
      {
        tag: "path",
        attr: {
          d: "M8 16V12",
          // stroke: "#1F1F22",
          strokeWidth: "1.5",
          strokeLinecap: "round",
        },
        child: [],
      },
      {
        tag: "path",
        attr: {
          d: "M12 16V10",
          // stroke: "#1F1F22",
          strokeWidth: "1.5",
          strokeLinecap: "round",
        },
        child: [],
      },
      {
        tag: "path",
        attr: {
          d: "M16 16V8",
          // stroke: "#1F1F22",
          strokeWidth: "1.5",
          strokeLinecap: "round",
        },
        child: [],
      },
    ],
  })({ ...props });
};

export const FileIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      width: "16",
      height: "20",
      viewBox: "0 0 16 20",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "path",
        attr: {
          d: "M2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H14C14.5304 20 15.0391 19.7893 15.4142 19.4142C15.7893 19.0391 16 18.5304 16 18V6L10 0H2ZM2 2H9V7H14V18H2V2ZM4 10V12H12V10H4ZM4 14V16H9V14H4Z",
          fill: "#8E9499",
        },
        child: [],
      },
    ],
  })({ ...props });
};

export const MailIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      width: "50",
      height: "40",
      viewBox: "0 0 50 40",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "path",
        attr: {
          d: "M8.125 1.7438e-08H41.875C43.9503 -0.000135867 45.9471 0.793885 47.4556 2.21918C48.9641 3.64447 49.87 5.59298 49.9875 7.665L50 8.125V31.875C50.0001 33.9503 49.2061 35.9471 47.7808 37.4556C46.3555 38.9641 44.407 39.87 42.335 39.9875L41.875 40H8.125C6.04966 40.0001 4.05293 39.2061 2.54442 37.7808C1.03592 36.3555 0.129997 34.407 0.0125003 32.335L1.7438e-08 31.875V8.125C-0.000135867 6.04966 0.793885 4.05293 2.21918 2.54442C3.64447 1.03592 5.59298 0.129997 7.665 0.0125003L8.125 1.7438e-08ZM46.25 13.4325L25.875 24.1575C25.6449 24.279 25.3921 24.3514 25.1326 24.3699C24.873 24.3884 24.6125 24.3527 24.3675 24.265L24.1275 24.16L3.75 13.435V31.875C3.75004 32.973 4.16293 34.0308 4.9067 34.8385C5.65047 35.6462 6.67075 36.1446 7.765 36.235L8.125 36.25H41.875C42.9734 36.2499 44.0315 35.8367 44.8393 35.0924C45.647 34.3481 46.1452 33.3272 46.235 32.2325L46.25 31.875V13.4325ZM41.875 3.75H8.125C7.02703 3.75004 5.96921 4.16293 5.16152 4.9067C4.35384 5.65047 3.85535 6.67075 3.765 7.765L3.75 8.125V9.1975L25 20.3825L46.25 9.195V8.125C46.2499 7.02663 45.8367 5.96847 45.0924 5.16073C44.3481 4.35299 43.3272 3.85475 42.2325 3.765L41.875 3.75Z",
          fill: props.fill || "#B7BBBF",
        },
        child: [],
      },
    ],
  })({ ...props });
};

export const FlagIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      width: "16",
      height: "20",
      viewBox: "0 0 16 20",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "path",
        attr: {
          d: "M1 11.9996C1.93464 11.0835 3.19124 10.5703 4.5 10.5703C5.80876 10.5703 7.06536 11.0835 8 11.9996C8.93464 12.9157 10.1912 13.4289 11.5 13.4289C12.8088 13.4289 14.0654 12.9157 15 11.9996V2.9996C14.0654 3.91573 12.8088 4.42888 11.5 4.42888C10.1912 4.42888 8.93464 3.91573 8 2.9996C7.06536 2.08346 5.80876 1.57031 4.5 1.57031C3.19124 1.57031 1.93464 2.08346 1 2.9996V11.9996ZM1 11.9996V18.9996",
          stroke: props.stroke || "#54575A",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        },
        child: [],
      },
    ],
  })({ ...props });
};

export const PinIcon = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      width: "18",
      height: "18",
      viewBox: "0 0 18 18",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "path",
        attr: {
          d: "M12 1.5L8 5.5L4 7L2.5 8.5L9.5 15.5L11 14L12.5 10L16.5 6M6 12L1.5 16.5M11.5 1L17 6.5",
          // stroke: props.stroke || "#54575A",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        },
        child: [],
      },
    ],
  })({ ...props });
};

export const PrifinaLogo = (props) => {
  return GenIcon({
    tag: "svg",
    attr: {
      width: "36",
      height: "31",
      viewBox: "0 0 36 31",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    },
    child: [
      {
        tag: "path",
        attr: {
          fillRule: "evenodd",
          clipRule: "evenodd",
          d: "M0 19.5815V15.357L17.9996 25.9182L25.1998 21.6937V25.9182L17.9996 30.1427L0 19.5815ZM10.7994 13.2448L17.9996 9.02027L36 19.5815V23.806L25.1998 17.4692L17.9996 21.6937L10.7994 17.4692L0 11.1325V6.90802L10.7994 13.2448ZM14.3995 15.357L17.9996 17.4692L21.5997 15.357L17.9996 13.2448L14.3995 15.357ZM36 11.1325V15.357L17.9996 4.79578L10.7994 9.02027V4.79578L17.9996 0.571289L36 11.1325Z",
          fill: "#00847A",
          // d: "M2 6.64313V14.6431H18V6.64313L10 9.64313L2 6.64313ZM2 2.64313V4.64313L10 7.64313L18 4.64313V2.64313H2ZM2 0.643127H18C18.5304 0.643127 19.0391 0.853841 19.4142 1.22891C19.7893 1.60399 20 2.11269 20 2.64313V14.6431C20 15.1736 19.7893 15.6823 19.4142 16.0573C19.0391 16.4324 18.5304 16.6431 18 16.6431H2C1.46957 16.6431 0.960859 16.4324 0.585786 16.0573C0.210714 15.6823 0 15.1736 0 14.6431V2.64313C0 2.11269 0.210714 1.60399 0.585786 1.22891C0.960859 0.853841 1.46957 0.643127 2 0.643127Z",
          // fill: "#FAFAFA",
        },
        child: [],
      },
    ],
  })({ ...props });
};
