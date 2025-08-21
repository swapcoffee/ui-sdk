import dedustIcon from '@/assets/contributors/dedust-icon.png';
import stonfiIcon from '@/assets/contributors/stonfi-icon.png';
import stonfiV2Icon from '@/assets/contributors/stonfi-v2-icon.png';
import toncoIcon from '@/assets/contributors/tonco.png';
import tonstakersIcon from '@/assets/contributors/tonstakers.svg';
import colossusIcon from '@/assets/contributors/colossus_icon.png';
import CoffeeIcon from '@/assets/contributors/coffee_icon.webp';
import torchFinanceIcon from '@/assets/contributors/torch_icon.svg';
import moonCxIcon from '@/assets/contributors/mooncx-icon.svg';
import bidaskIcon from '@/assets/contributors/bidask-icon.svg';

export const DEXES = [
    {
        id: 'coffee',
        name: 'Coffee DEX',
        icon: CoffeeIcon,
        added_later: true,
    },
    {
        id: 'stonfi',
        name: 'STON.fi V1',
        icon: stonfiIcon
    },
    {
        id: 'stonfi_v2',
        name: 'STON.fi V2',
        icon: stonfiV2Icon
    },
    {
        id: 'dedust',
        name: 'DeDust',
        icon: dedustIcon
    },
    {
        id: 'tonco',
        name: 'TONCO',
        icon: toncoIcon
    },
    {
        id: 'tonstakers',
        name: 'Tonstakers',
        icon: tonstakersIcon,
        added_later: false,
        disabled_in_yield: true
    },
    {
        id: 'colossus',
        name: 'Colossus',
        icon: colossusIcon,
        added_later: false
    },
    {
        id: 'torch_finance',
        name: 'Torch Finance',
        icon: torchFinanceIcon,
        added_later: true
    },
    {
        id: 'moon',
        name: 'Moon.cx',
        icon: moonCxIcon,
        added_later: true
    },
    {
        id: 'bidask',
        name: 'Bidask',
        icon: bidaskIcon,
        added_later: true
    }
]

export const DEXES_BY_ID = new Map(DEXES.map(it => ([it.id, it])))
export const DEXES_IDS = [...DEXES_BY_ID.keys()]
