"use client";

import Script from "next/script";

const TWEET_URL =
  "https://x.com/Ranjit0dedra/status/2074326347522969780?ref_src=twsrc%5Etfw";

export function LandingVideo() {
  return (
    <section
      className="mt-32 flex w-full flex-col items-center gap-10"
      aria-labelledby="video-heading"
    >
      <h2
        id="video-heading"
        className="text-center text-3xl font-bold tracking-tight md:text-4xl"
      >
        See it in action
      </h2>

      <div className="flex w-full max-w-[560px] justify-center [&_.twitter-tweet]:mx-auto!">
        <blockquote className="twitter-tweet" data-media-max-width="560">
          <p lang="en" dir="ltr">
            I built something to solve a problem I personally hated while job
            hunting.
            <br />
            <br />
            Try it here:{" "}
            <a href="https://t.co/I19ODRnRbm">https://t.co/I19ODRnRbm</a>
            <br />
            <br />
            Keeping track of applications is painful. Notion templates and Excel
            sheets work, but manually copying job details, updating statuses,
            and remembering follow-ups gets…{" "}
            <a href="https://t.co/DO6f2bAi3e">pic.twitter.com/DO6f2bAi3e</a>
          </p>
          &mdash; Ranjit Odedra (@Ranjit0dedra){" "}
          <a href={TWEET_URL}>July 7, 2026</a>
        </blockquote>
      </div>

      <Script src="https://platform.x.com/widgets.js" strategy="lazyOnload" />
    </section>
  );
}
