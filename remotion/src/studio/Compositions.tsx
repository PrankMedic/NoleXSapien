import { BanTinNghienCuu } from './BanTin';
import { bulletin } from './data/mau';
import { Composition, Folder, Still } from 'remotion';
import { framesOf } from '../formats/timeline';
import { CarouselSlide, ChartStory, ChatQA, Journey, KineticType, Mechanism, MythFact, NewsDesk, PodcastWave, Versus } from './Formats';
import { base, carousel, chart, chat, journey, kinetic, mechanism, myth, news, podcast, versus } from './data/mau';
import { DataCompositions } from './registry';

const video = { width: 1080, height: 1920, fps: 30, durationInFrames: framesOf(base.segments) };
export const StudioCompositions = () => <Folder name="Dinh-dang-moi-2">
  <Composition {...video} id="MauKineticType" component={KineticType} defaultProps={kinetic} />
  <Composition {...video} id="MauMechanism" component={Mechanism} defaultProps={mechanism} />
  <Composition {...video} id="MauChartStory" component={ChartStory} defaultProps={chart} />
  <Composition {...video} id="MauVersus" component={Versus} defaultProps={versus} />
  <Composition {...video} id="MauMythFact" component={MythFact} defaultProps={myth} />
  <Composition {...video} id="MauChatQA" component={ChatQA} defaultProps={chat} />
  <Composition {...video} id="MauJourney" component={Journey} defaultProps={journey} />
  <Composition {...video} id="MauNewsDesk" component={NewsDesk} defaultProps={news} />
  <Composition {...video} id="MauPodcastWave" component={PodcastWave} defaultProps={podcast} />
  <Still id="MauCarouselSlide" component={CarouselSlide} defaultProps={carousel} width={1080} height={1350} />
  <Composition {...video} id="MauBanTin" component={BanTinNghienCuu} defaultProps={bulletin} />
  <DataCompositions />
</Folder>;
