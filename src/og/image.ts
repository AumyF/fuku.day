import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND_COLOR = "#fef1e2";
const BODY_TEXT_BUDGET = 1200;
const FONT_FAMILY = "Noto Sans JP";
const BACKGROUND_BLEED = 50;
const TITLE_BAND_HEIGHT = 220;

// Vite's dev-mode HMR re-evaluates this module (resetting module-level
// state) without re-initializing the underlying WASM runtime, which is a
// process-wide singleton and throws if initWasm() is called a second time.
// Stashing the promise on globalThis lets it survive module reloads.
const wasmReadyKey = Symbol.for("fuku.day/og/resvg-wasm-ready");
const globalWithWasm = globalThis as typeof globalThis & {
  [wasmReadyKey]?: Promise<void>;
};

function resolvePackagePath(specifier: string): string {
  return fileURLToPath(import.meta.resolve(specifier));
}

async function ensureWasmInitialized() {
  if (!globalWithWasm[wasmReadyKey]) {
    globalWithWasm[wasmReadyKey] = (async () => {
      const wasmBuffer = await readFile(
        resolvePackagePath("@resvg/resvg-wasm/index_bg.wasm"),
      );
      await initWasm(wasmBuffer);
    })();
  }
  return globalWithWasm[wasmReadyKey];
}

type FontWeight = 500 | 600;

let fontDataPromise:
  | Promise<
      { name: string; data: Buffer; weight: FontWeight; style: "normal" }[]
    >
  | undefined;

async function loadFonts() {
  if (!fontDataPromise) {
    const subsets = ["japanese", "latin"] as const;
    const weights = [500, 600] as const;
    fontDataPromise = Promise.all(
      subsets.flatMap((subset) =>
        weights.map(async (weight) => {
          const fontPath = resolvePackagePath(
            `@fontsource/noto-sans-jp/files/noto-sans-jp-${subset}-${weight}-normal.woff`,
          );
          return {
            name: FONT_FAMILY,
            data: await readFile(fontPath),
            weight,
            style: "normal" as const,
          };
        }),
      ),
    );
  }
  return fontDataPromise;
}

type SatoriNode = {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: SatoriNode[] | string | null;
  };
};

function div(
  style: Record<string, string | number>,
  children?: SatoriNode[] | string,
): SatoriNode {
  return { type: "div", props: { style, children: children ?? null } };
}

function repeatToBudget(text: string, budget: number): string {
  if (text.length === 0) return "";
  if (text.length >= budget) return text.slice(0, budget);
  const times = Math.ceil(budget / text.length);
  return text.repeat(times).slice(0, budget);
}

export function buildOgTree({
  title,
  bodyText,
}: {
  title: string;
  bodyText: string;
}): SatoriNode {
  const background = div(
    {
      position: "absolute",
      top: "0px",
      left: `${-BACKGROUND_BLEED}px`,
      width: `${WIDTH + BACKGROUND_BLEED * 2}px`,
      height: `${HEIGHT}px`,
      display: "flex",
      fontSize: 40,
      transform: "rotate(-2deg) translateY(-40px) scaleY(1.4)",
      lineHeight: 0.75,
      letterSpacing: "-0.07em",
      fontWeight: 500,
      color: "#39527b",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      padding: "8px",
      fontFamily: FONT_FAMILY,
    },
    shuffle(repeatToBudget(bodyText, BODY_TEXT_BUDGET)).join("　"),
  );

  const titleBand = div(
    {
      display: "flex",
      maxWidth: "1000px",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "right",
      padding: "24px 48px",
      backgroundColor: "#d686a7",
      fontSize: 60,
      fontWeight: 600,
      color: "#333",
      fontFamily: FONT_FAMILY,
      transform: "scaleY(0.7)",
      letterSpacing: "-0.1em",
    },
    [div({}, title)],
  );

  const foreground = div(
    {
      position: "absolute",
      top: `${(HEIGHT - TITLE_BAND_HEIGHT) / 2}px`,
      left: "0px",
      width: `${WIDTH}px`,
      height: `${TITLE_BAND_HEIGHT}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    [titleBand],
  );

  return div(
    {
      position: "relative",
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
      display: "flex",
      backgroundColor: BACKGROUND_COLOR,
    },
    [background, foreground],
  );
}

function shuffle(text: string) {
  const arr = text.split(/[、。　]/);
  for (const i of arr.keys()) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export async function generateOgImage({
  title,
  bodyText,
}: {
  title: string;
  bodyText: string;
}): Promise<Buffer> {
  const [fonts] = await Promise.all([loadFonts(), ensureWasmInitialized()]);

  const tree = buildOgTree({ title, bodyText });
  const svg = await satori(tree as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, { background: BACKGROUND_COLOR });
  const png = resvg.render().asPng();
  return Buffer.from(png);
}
