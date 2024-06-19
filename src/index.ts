import { watch } from 'chokidar';
import {
  EncoreUploadModule,
  EncoreUploadModuleOptions
} from '@eyevinn/iaf-plugin-encore-local';
import { Logger } from 'eyevinn-iaf';
import { readConfig } from './config';
import path from 'node:path';
import fs from 'node:fs';

const logger: Logger = {
  verbose: (message: string) => console.log(`[VERBOSE] ${message}`),
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.log(`[WARN] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`)
};

const config = readConfig();

const encoreUploader = new EncoreUploadModule({
  encoreEndpoint: config.encoreParams.url,
  inputLocation: config.encoreParams.inputFolder,
  outputDestination: config.encoreParams.outputFolder,
  encodeParams: config.encoreParams,
  logger,
  monitorJobs: false,
  jobCustomizer: (job) => {
    const subtitles = getSubtitleFile(job.inputs[0].uri);
    if (subtitles) {
      logger.verbose(`found subtitles: ${subtitles}`);
      job.inputs[0].videoFilters = [`subtitles=${subtitles}`];
    }
    return job;
  }
} as EncoreUploadModuleOptions);

logger.info(`Watching for new files in ${config.watchFolder}`);
const watcher = watch([`${config.watchFolder}/${config.filePattern}`], {
  persistent: true,
  ignoreInitial: true
});

watcher.on('add', (filePath) => {
  const encorePath = config.encoreParams.inputFolder
    ? filePath.replace(config.watchFolder, config.encoreParams.inputFolder)
    : path.resolve(filePath);
  logger.info(`Will transcode '${filePath}'(${encorePath})`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encoreUploader.onFileAdd(encorePath, undefined as any).catch((err) => {
    logger.error(`Error processing file ${path}: ${err}`);
  });
});

function getSubtitleFile(filePath: string) {
  if (!config.subtitleSuffix) {
    return undefined;
  }
  const p = path.parse(filePath);
  const subtitlePath = path.join(p.dir, `${p.name}${config.subtitleSuffix}`);
  logger.verbose(`Checking for subtitle file: ${subtitlePath}`);
  if (fs.existsSync(subtitlePath)) {
    return subtitlePath;
  }
  return undefined;
}
