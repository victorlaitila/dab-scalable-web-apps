import http from "k6/http";

export const options = {
  duration: "30s",
  vus: 10,
};

export default function () {
  http.get("http://192.168.49.2:32512");
}