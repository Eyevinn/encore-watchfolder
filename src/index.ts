import { watch } from 'chokidar';
import {
  EncoreUploadModule,
  EncoreUploadModuleOptions
} from '@eyevinn/iaf-plugin-encore-local';
import { Logger } from 'eyevinn-iaf';
import { readConfig } from './config';
import path from 'node:path';

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
  monitorJobs: false
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
  logger.info(`Will transcode '${path}'(${encorePath})`);

  encoreUploader.onFileAdd(encorePath, undefined as any).catch((err) => {
    logger.error(`Error processing file ${path}: ${err}`);
  });
});
