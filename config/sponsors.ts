import { StaticImageData } from 'next/image';

import colaLogo from '../public/sponsors/cola-logo.png';
import jupilerLogo from '../public/sponsors/jupiler-logo.png';
import kbcLogo from '../public/sponsors/kbc-logo.png';
import redbullLogo from '../public/sponsors/redbull-logo.png';
import stubruLogo from '../public/sponsors/studiobrussel-logo.png';
import twitchLogo from '../public/sponsors/twitch-logo.png';
import winforlifeLogo from '../public/sponsors/winforlife-logo.png';

export interface SponsorType {
    lng: number,
    lat: number,
    logo: StaticImageData,
    id: string,
    price: string,
    size?: number,
}

export const sponsors: Array<SponsorType> = [
    {
        lng: 4.681973,
        lat: 50.968945,
        logo: kbcLogo,
        id: 'kbc',
        price: 'frisbee',
    },
    {
        lng: 4.682827,
        lat: 50.969121,
        logo: winforlifeLogo,
        id: 'winforlife',
        price: 'kraslot',
        size: 0.425,
    },
    {
        lng: 4.683993,
        lat: 50.969449,
        logo: colaLogo,
        id: 'cola',
        price: 'pet',
    },
    {
        lng: 4.684338,
        lat: 50.968868,
        logo: twitchLogo,
        id: 'twitch',
        price: 'zonnebril',
    },
    {
        lng: 4.684847,
        lat: 50.966581,
        logo: jupilerLogo,
        id: 'jupiler',
        price: 'T-shirt',
        size: 0.275,
    },
    {
        lng: 4.682306,
        lat: 50.967280,
        logo: stubruLogo,
        id: 'stubru',
        price: 'tote bag',
        size: 0.28,
    },
    {
        lng: 4.682665,
        lat: 50.966823,
        logo: redbullLogo,
        id: 'redbull',
        price: 'energiedrank',
        size: 0.4,
    },
];