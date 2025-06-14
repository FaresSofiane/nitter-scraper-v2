import { fetchTweets } from "../dist/index.js";

async function main() {
  // const tweets = await fetchTweets("psg_inside", 3, true, {
  //   proxyUrl:
  //     "", // url of the proxy list
  // }); // username without @, max pages (optional)

  const tweets = await fetchTweets("psg_inside", 3);


}

main().catch(console.error);
