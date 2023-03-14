import fs from "fs";
import os from "os";
import chalk from "chalk";
import decompress from "decompress";
import decompressUnzip from "decompress-unzip";
import dotenv from "dotenv";
import minimist from "minimist";
import fetch from "node-fetch";
import { ls, mkdir, mv } from "shelljs";
import { writeFile } from "./helpers";
import i18n, { appLocales } from "./i18n";

// eslint-disable-next-line no-undef
const argv = minimist(process.argv.slice(2));

dotenv.config({ path: ".env.local" });

const renameMap = (lang) =>
  ({
    zh_Hant_TW: "zh-Hant",
    zh_Hans_CN: "zh-Hans",
    zh_TW: "zh-Hant",
    zh_CN: "zh-Hans",
    pt_BR: "pt",
    // pt_PT: 'pt',
  }[lang] || lang);

// eslint-disable-next-line no-undef
const { REACT_APP_LOKALIZE_TOKEN, REACT_APP_PROJECT_ID } = process.env;

const API_URL = "https://api.lokalise.co/api2/projects";

const logger = console;

const waitFor = (ms) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

function readAndEncodeToBase64(file) {
  const data = fs.readFileSync(file);
  return data.toString("base64");
}

const lokalizeAPI = (endpoint, id, data = {}) =>
  fetch(`${API_URL}/${id}/${endpoint}`, {
    headers: { "X-Api-Token": REACT_APP_LOKALIZE_TOKEN },
    method: "POST",
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        logger.error(res.error.message);
        return Promise.reject(res);
      }

      return res;
    });

const createSnapshot = (id) =>
  lokalizeAPI("snapshots", id, {
    title: `Snapshot from API by ${os.userInfo().username}`,
  });

const importToLokalize = (id) => {
  const filepath = "src/translations/en.json";
  return lokalizeAPI("files/upload", id, {
    data: readAndEncodeToBase64(filepath),
    filename: filepath,
    lang_iso: "en",
    distinguish_by_file: false,
    hidden_from_contributors: true,
    convert_placeholders: false,
  });
};

const exportLokalize = (id) =>
  lokalizeAPI("files/download", id, {
    format: "json",
    filter_data: ["translated"],
    export_sort: "a_z",
    original_filenames: false,
    replace_breaks: false,
    bundle_structure: "%LANG_ISO%.%FORMAT%",
  });

async function processProjectUpload(id) {
  try {
    await createSnapshot(id);

    logger.log(chalk.green("📷  Done creating snapshot of current state."));

    await waitFor(5000); // lokalize requires api calls to be delayed for more than 5 seconds

    await importToLokalize(id);

    logger.log(chalk.green("📝  Done uploading to Lokalize."));

    await waitFor(5000); // lokalize requires api calls to be delayed for more than 5 seconds
  } catch (err) {
    logger.error(err);
  }
}

async function processProjectDownload(id) {
  const tmpRoot = ".tmp/lokalise";
  const exchangePathname = `${tmpRoot}/Exchange-locale`;
  const dest = "src/translations";

  try {
    const zipPathname = "exchangePathname.zip";
    const decompressFilename = exchangePathname;

    mkdir("-p", tmpRoot);

    const zipFile = fs.createWriteStream(zipPathname);
    const { bundle_url: link } = await exportLokalize(id);

    logger.log(`Downloading i18n from ${chalk.magenta(link)}`);

    const response = await fetch(link, { method: "GET" });

    logger.log("processing downloaded i18n files...");

    await new Promise((resolve) =>
      response.body.pipe(zipFile).on("finish", () => {
        decompress(zipPathname, decompressFilename, {
          plugins: [decompressUnzip()],
        }).then(() => {
          resolve();
        });
      })
    );

    const i18nFilepaths = ls(decompressFilename).map((filename) => {
      const rename = `${renameMap(
        filename.replace(/(campaign-|\.json)/g, "")
      )}.json`;
      if (rename !== filename) {
        mv(
          `${decompressFilename}/${filename}`,
          `${decompressFilename}/${rename}`
        );
      }

      return `${decompressFilename}/${rename}`;
    });

    mkdir("-p", dest);
    mv(i18nFilepaths, dest);
    logger.log("Successfully update to latest i18n");
  } catch (err) {
    logger.error(err);
  }
}

async function writeLocaleFile() {
  const locales = appLocales;
  const localeNames = {};

  locales.forEach((locale) => {
    const translationFileName = `src/translations/${locale}.json`;
    try {
      const messages = JSON.parse(fs.readFileSync(translationFileName));

      localeNames[locale] = messages.web_locale_name;
    } catch (error) {
      if (error.code !== "ENOENT") {
        process.stderr.write(
          `There was an error loading this translation file: ${translationFileName}
          \n${error}`
        );
      }
    }
  });

  await writeFile(
    "src/translations/localeNames.json",
    `${JSON.stringify(localeNames, null, 2)}\n`
  );
  logger.log("Successfully added src/translations/localeNames.json");
}

async function upload() {
  logger.log(chalk.green("Processing Exchange."));
  await processProjectUpload(REACT_APP_PROJECT_ID);
}

async function download() {
  logger.log(chalk.green("Processing Exchange."));
  await processProjectDownload(REACT_APP_PROJECT_ID);

  logger.log(chalk.green("Processing locale names."));
  await writeLocaleFile();
}

(() => {
  if (!REACT_APP_LOKALIZE_TOKEN) {
    logger.error("No lokalize token specified!");
    return;
  }

  if (argv.upload) {
    upload();
  } else if (argv.download) {
    download();
  } else {
    logger.log(`
      --upload\t\tupload to lokalise (only main langague keys)
      --download\tdownaload from lokalise
    `);
  }
})();
