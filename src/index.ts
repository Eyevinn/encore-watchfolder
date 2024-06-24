import { watch } from 'chokidar';
import { EncoreUploadModule } from '@eyevinn/iaf-plugin-encore-local';
import { Logger } from 'eyevinn-iaf';
import { readConfig } from './config';
import path from 'node:path';
import fs from 'node:fs';
import { minimatch } from 'minimatch';
import globParent from 'glob-parent';

const logger: Logger = {
  verbose: (message: string) => console.log(`[VERBOSE] ${message}`),
  info: (message: string) => console.log(`[INFO] ${message}`),
  warn: (message: string) => console.log(`[WARN] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`)
};

const config = readConfig();

const jobCustomizer = (job) => {
  const subtitles = getSubtitleFile(job.inputs[0].uri);
  if (subtitles) {
    logger.verbose(`found subtitles: ${subtitles}`);
    job.inputs[0].videoFilters = [`subtitles=${subtitles}`];
  }
  logger.verbose('Using profile: ' + job.profile);
  return job;
};

const encoreUploaders: { pattern: string; uploader: EncoreUploadModule }[] = [];
config.watchPatterns.forEach((wp) => {
  encoreUploaders.push({
    pattern: wp.pattern,
    uploader: new EncoreUploadModule({
      encoreEndpoint: config.encoreParams.url,
      outputDestination: config.encoreParams.outputFolder,
      encodeParams: {
        ...config.encoreParams,
        profile: wp.profile || config.encoreParams.profile,
        password: undefined
      },
      logger,
      monitorJobs: false,
      jobCustomizer,
      encoreAuth: config.encoreParams.password
        ? {
            username: 'admin',
            password: config.encoreParams.password
          }
        : undefined
    })
  });
});

logger.info(
  `Watching for new files: ${config.watchPatterns
    .map((wp) => wp.pattern)
    .join(', ')}`
);
const watcher = watch(
  config.watchPatterns.map((wp) => wp.pattern),
  {
    persistent: true,
    ignoreInitial: true
  }
);

watcher.on('add', (filePath) => {
  const pattern = getPattern(filePath);
  const watchFolder = globParent(pattern?.pattern || '.');
  const encorePath = config.encoreParams.inputFolder
    ? filePath.replace(watchFolder, config.encoreParams.inputFolder)
    : path.resolve(filePath);

  const encoreUploader = getUploader(filePath);
  if (!encoreUploader) {
    logger.error(`No uploader found for file ${filePath}`);
  } else {
    logger.info(`Will transcode '${filePath}'(${encorePath})}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encoreUploader.onFileAdd(encorePath, undefined as any).catch((err) => {
      logger.error(`Error processing file ${filePath}: ${err}`);
    });
  }
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

function getUploader(filePath: string) {
  const uploader = encoreUploaders.find((uploader) =>
    minimatch(filePath, uploader.pattern)
  );
  return uploader?.uploader;
}

function getPattern(filePath: string) {
  return config.watchPatterns.find((wp) => minimatch(filePath, wp.pattern));
}
