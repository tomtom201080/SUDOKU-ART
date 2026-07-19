// src/components/questIcons/index.js
import {
  MeltingClockIcon,
  SurrealEyeIcon,
  PaletteIcon,
  PicassoFaceIcon,
  FrameIcon,
  DoveIcon,
  ART_ICONS
} from './artIcons.jsx';
import {
  GearClusterIcon,
  FlyingMachineIcon,
  QuillScrollIcon,
  CompassIcon,
  VitruvianMotifIcon,
  CastleTowerIcon,
  DAVINCI_ICONS
} from './davinciIcons.jsx';
import { ART_CHAPTERS, DAVINCI_CHAPTERS } from './chapters.js';

const ICON_REGISTRY = {
  MeltingClockIcon, SurrealEyeIcon, PaletteIcon, PicassoFaceIcon, FrameIcon, DoveIcon,
  GearClusterIcon, FlyingMachineIcon, QuillScrollIcon, CompassIcon, VitruvianMotifIcon, CastleTowerIcon
};

export function resolveIcon(name) {
  return ICON_REGISTRY[name] ?? null;
}

export { ART_ICONS, DAVINCI_ICONS, ART_CHAPTERS, DAVINCI_CHAPTERS };
