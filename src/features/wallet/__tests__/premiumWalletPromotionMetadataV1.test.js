import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const panel =
  fs.readFileSync(
    new URL(
      "../components/WalletTopupPanel.jsx",
      import.meta.url
    ),
    "utf8"
  );

const offers =
  fs.readFileSync(
    new URL(
      "../components/WalletTopupOffers.jsx",
      import.meta.url
    ),
    "utf8"
  );

const domain =
  fs.readFileSync(
    new URL(
      "../domain/walletTopupDomain.js",
      import.meta.url
    ),
    "utf8"
  );


test(
  "promotion domain preserves backend campaign metadata",
  () => {
    assert.match(
      domain,
      /name:[\s\S]*data\.name/
    );

    assert.match(
      domain,
      /startsAt:[\s\S]*data\.starts_at/
    );

    assert.match(
      domain,
      /endsAt:[\s\S]*data\.ends_at/
    );
  }
);


test(
  "customer panel renders authoritative campaign name",
  () => {
    assert.match(
      panel,
      /campaignName/
    );

    assert.match(
      panel,
      /activePromotion\?\.name/
    );

    assert.match(
      panel,
      /\{campaignName\s*\|\|/
    );
  }
);


test(
  "customer panel renders exact configured campaign period",
  () => {
    assert.match(
      panel,
      /activePromotion\?\.startsAt/
    );

    assert.match(
      panel,
      /activePromotion\?\.endsAt/
    );

    assert.match(
      panel,
      /Bắt đầu/
    );

    assert.match(
      panel,
      /Kết thúc/
    );

    assert.match(
      panel,
      /Asia\/Ho_Chi_Minh/
    );
  }
);


test(
  "customer panel does not infer campaign activity from local time",
  () => {
    assert.doesNotMatch(
      panel,
      /Date\.now/
    );

    assert.doesNotMatch(
      panel,
      /new Date\(\)\s*[<>]/
    );

    assert.match(
      panel,
      /promotion\?\.active ===[\s\S]*true/
    );
  }
);


test(
  "tier offer rail keeps authoritative featured marker",
  () => {
    assert.match(
      offers,
      /tier\.isFeatured/
    );

    assert.match(
      offers,
      /🔥 ĐANG HOT/
    );

    assert.match(
      offers,
      /tier\.bonusAmount/
    );

    assert.match(
      offers,
      /tier\.receiveAmount/
    );
  }
);


test(
  "offer rail no longer owns duplicate generic promotion heading",
  () => {
    assert.doesNotMatch(
      offers,
      /Ưu đãi nạp nổi bật/
    );

    assert.doesNotMatch(
      offers,
      /TOP-UP PRIVILEGES/
    );
  }
);
