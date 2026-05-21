const MONETAG_SCRIPT_SRC = "https://quge5.com/88/tag.min.js";
const MONETAG_DATA_ZONE = "241703";

export function MonetagTag() {
  return (
    <script
      id="monetag-multitag"
      src={MONETAG_SCRIPT_SRC}
      async
      data-zone={MONETAG_DATA_ZONE}
      data-cfasync="false"
    />
  );
}
