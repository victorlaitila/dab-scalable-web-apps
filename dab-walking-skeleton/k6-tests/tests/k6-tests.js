import http from "k6/http";
import { check } from "k6";

// Example command: docker compose run --rm --entrypoint=k6 k6-tests run /tests/k6-tests.js

export const options = {
  vus: 5,
  duration: "10s",
};

export default () => {
  const url = "http://server:8000/";
  const res = http.get(url);

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
};
