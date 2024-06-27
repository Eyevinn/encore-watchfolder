# Encore watchfolder

Watches a folder for new files and triggers an encore job for each new file.

## Requirements

A running [encore](https://github.com/svt/encore) instance that jobs can be posted to.

## Installation / Usage

### Environment variables

| Variable                     | Description                                                                                                                                                                                    | Default value                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `ENCORE_URL`                 | URL to the encore instance                                                                                                                                                                     | `http://localhost:8080`                       |
| `ENCORE_PROFILE`             | Profile to use for started jobs                                                                                                                                                                | 'program'                                     |
| `ENCORE_CALLBACK_URL`        | callback url to set in jobs                                                                                                                                                                    |                                               |
| `ENCORE_INPUT_FOLDER`        | If the folder where files arrive is mounted under a different path in the encore container, set this to the path in the container corresponding to the watchfolder                             |                                               |
| `ENCORE_OUTPUT_FOLDER`       | Base output folder                                                                                                                                                                             | `out`                                         |
| `ENCORE_PASSWORD`            | Optional password for the encore instance `admin` user                                                                                                                                         |                                               |
| `WATCH_PATTERNS`             | Comma separated list of file patterns to watch. A transcoding profile can be included after a colon separator.                                                                                 | `watch/**/*.mp4,watch2/**/*.mp4:fast-profile` |
| `SUBTITLES_SUFFIX`           | If set, the service will look for a file with the same name as the video file (minus extension) but with this suffix. If found, the subtitles from the found file will be burnt into the video |                                               |
| `CHOKIDAR_USEPOLLING`        | Use polling for file watching. May need to be set to true when running inside docker or with network filesystem.                                                                               | `false`                                       |
| `JOB_CUSTOMIZER_PLUGIN_PATH` | Optioal path to a javscript file defining a job customizer, see below                                                                                                                          |                                               |

### Job customizer

A function for customizing jobs can be provided by setting the `JOB_CUSTOMIZER_PLUGIN_PATH` environment variable to the path of a javascript file. The file should export a function `customizeJob` that takes a job object as argument and returns the modified job object.

Example job customizer

```javascript
const fs = require('node:fs');
const path = require('node:path');

// Enable debugOverlay when the input file name ends with _DEBUG
export function customizeJob(job) {
  const file = job.inputs[0].uri;
  const p = path.parse(file);
  if (p.name.endsWith('_DEBUG')) {
    job.debugOverlay = true;
  }
  return true;
}
```

### Running

Once environment has been configured as describe above, the service can be started with

```bash
npm run start
```

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## License

This project is licensed under the MIT License, see [LICENSE](LICENSE).

# Support

Join our [community on Slack](http://slack.streamingtech.se) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

- Further development of this component
- Customization and integration of this component into your platform
- Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.

# About Eyevinn Technology

[Eyevinn Technology](https://www.eyevinntechnology.se) is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward we develop proof-of-concepts and tools. The things we learn and the code we write we share with the industry in [blogs](https://dev.to/video) and by open sourcing the code we have written.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!
