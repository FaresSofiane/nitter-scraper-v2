import { fetchTweets } from "../dist/index.js";

async function main() {
  // const tweets = await fetchTweets("psg_inside", 3, true, {
  //   proxyUrl:
  //     "", // url of the proxy list
  // }); // username without @, max pages (optional)

  const tweets = await fetchTweets("psg_inside", 3);

  console.log("tweets");

  for (const tweet of tweets) {
    console.log("------");
    console.log("Tweet:", tweet.text);
    console.log("Tweet:", tweet.cards);
  }
}

main().catch(console.error);
