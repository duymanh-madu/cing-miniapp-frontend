import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";


const root =
  process.cwd();

const counter =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/AdminWalletPosCounter.jsx"
    ),
    "utf8"
  );

const api =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/adminWalletPosApi.js"
    ),
    "utf8"
  );

const dashboard =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/components/AdminDashboard.jsx"
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    path.join(
      root,
      "src/features/admin/wallet-pos/admin-wallet-pos.css"
    ),
    "utf8"
  );


test(
  "Cing Pay has dedicated admin tab",
  () => {
    assert.match(
      dashboard,
      /key:"wallet_pos"[\s\S]*label:"Cing Pay"/
    );

    assert.match(
      dashboard,
      /AdminWalletPosCounter/
    );
  }
);


test(
  "Counter V2 reads authoritative current manual session",
  () => {
    assert.match(
      api,
      /\/admin\/wallet\/pos\/manual-session/
    );

    assert.match(
      counter,
      /fetchCurrentWalletPosManualSession/
    );

    assert.doesNotMatch(
      counter,
      /supabase/i
    );
  }
);


test(
  "cashier create sends only amount and request_id",
  () => {
    assert.match(
      api,
      /\/admin\/wallet\/pos\/manual-payment/
    );

    assert.match(
      api,
      /\{\s*amount,\s*request_id:[\s\S]*requestId/
    );

    assert.doesNotMatch(
      api,
      /manual-payment[\s\S]{0,300}pos_parent|manual-payment[\s\S]{0,300}pos_id/
    );
  }
);


test(
  "cashier UX has no browser confirmation or bill identity entry",
  () => {
    assert.doesNotMatch(
      counter,
      /window\.confirm/
    );

    assert.doesNotMatch(
      counter,
      /sale_tran_id|bill_reference/
    );

    assert.match(
      counter,
      /TẠO QR/
    );
  }
);


test(
  "dynamic QR renders backend signed capability only",
  () => {
    assert.match(
      counter,
      /QRCode\.toDataURL/
    );

    assert.match(
      counter,
      /result\.qr_content/
    );

    assert.doesNotMatch(
      counter,
      /CING_WALLET_PAY_V1\.[A-Za-z0-9]/i
    );
  }
);


test(
  "paid state is operationally dominant and does not expose reconciliation workflow",
  () => {
    assert.match(
      counter,
      /ĐÃ THANH TOÁN/
    );

    assert.match(
      counter,
      /Có thể hoàn tất hóa đơn trên iPOS/
    );

    assert.doesNotMatch(
      counter,
      /Lệch đối soát/
    );
  }
);


test(

  "Super Admin mismatch alerts use dedicated resolution backoffice",

  () => {

    assert.match(

      api,

      /resolveWalletPosAlert/

    );

    assert.match(

      api,

      /reconciliation-alerts\/\$\{encodeURIComponent\([\s\S]*\}\/resolve/

    );

    assert.match(

      counter,

      /Cảnh báo đối soát/

    );

    assert.match(

      counter,

      /XÁC NHẬN QUYẾT ĐỊNH/

    );

    assert.match(

      counter,

      /resolveAlert/

    );

    assert.match(

      counter,

      /isSuperAdmin/

    );

  }

);


test(
  "polling fallback keeps current manual session fresh",
  () => {
    assert.match(
      counter,
      /POLL_INTERVAL_MS\s*=\s*1500/
    );

    assert.match(
      counter,
      /setInterval/
    );

    assert.match(
      counter,
      /fetchCurrentWalletPosManualSession/
    );
  }
);


test(
  "Counter remains responsive for tablet and phone",
  () => {
    assert.match(
      css,
      /max-width: 760px/
    );

    assert.match(
      css,
      /max-width: 440px/
    );
  }
);
