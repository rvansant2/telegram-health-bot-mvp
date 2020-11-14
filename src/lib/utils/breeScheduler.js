import Bree from 'bree';
import Cabin from 'cabin';
import Graceful from '@ladjs/graceful';
import { Signale } from 'signale';

// initialize cabin
const cabin = new Cabin({ axe: { logger: new Signale() } });

const breeScheduler = () => {
  const bree = new Bree({
    logger: cabin,
    jobs: [
      {
        name: 'scheduledGlucoseCheckins',
        interval: 'at 10:00 am also at 2:30 pm also at 7:00 pm',
      },
      {
        name: 'scheduledDiabetesTips',
        interval: 'at 8:00 am also at 9:00 pm',
      },
    ],
  });

  const graceful = new Graceful({ brees: [bree] });
  graceful.listen();

  bree.start();
};

export default breeScheduler;
