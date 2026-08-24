import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

global.pairingNumber = 21271597986;
global.owner = [['212698498657', '𝗠𝗬𝗦𝗧𝗢 𝗢𝗙𝗙', true]];

global.namebot = '𝗝𝗜𝗧𝗢𝗦𝗦𝗔 𝗕𝗢𝗧';
global.author = '';
global.source = 'https://whatsapp.com/channel/0029VbCxraN7T8bbAyc2j31J';

global.wait = 'جــاري تـحـمـيل...';
global.eror = 'وقـــع خـطـــــأ...';

/* ============== BOT MODE ============== */
/*
 * true  = البوت يخدم غير فالخاص
 * false = البوت يخدم فالخاص والمجموعات
 */
global.privateOnly = true;

/* ============== PAKASIR ============== */

global.pakasir = {
	slug: 'kilersbotz',
	apikey: 'bWDO2M8GcfruzXscdKNQJC3vw8Y8PV13',
	expired: 30,
};

/* ============== STICKER ============== */

global.stickpack = 'Croted By';
global.stickauth = namebot;

global.multiplier = 38;

/* ============== EMOJI ============== */

global.rpg = {
	emoticon(string) {
		string = String(string).toLowerCase();

		const emot = {
			level: '📊',
			limit: '🎫',
			health: '❤️',
			stamina: '🔋',
			exp: '✨',
			money: '💹',
			bank: '🏦',
			potion: '🥤',
			diamond: '💎',
			common: '📦',
			uncommon: '🛍️',
			mythic: '🎁',
			legendary: '🗃️',
			superior: '💼',
			pet: '🔖',
			trash: '🗑️',
			armor: '🥼',
			sword: '⚔️',
			pickaxe: '⛏️',
			fishingrod: '🎣',
			wood: '🪵',
			rock: '🪨',
			string: '🕸️',
			horse: '🐴',
			cat: '🐱',
			dog: '🐶',
			fox: '🦊',
			petFood: '🍖',
			iron: '⛓️',
			gold: '🪙',
			emerald: '❇️',
			upgrader: '🧰',
		};

		const results = Object.keys(emot)
			.map(v => [v, new RegExp(v, 'gi')])
			.filter(v => v[1].test(string));

		if (!results.length) return '';

		return emot[results[0][0]];
	},
};

/* ============== AUTO RELOAD ============== */

const file = fileURLToPath(import.meta.url);

watchFile(file, () => {
	unwatchFile(file);

	console.log(
		chalk.redBright("Update 'config.js'")
	);

	import(`${file}?update=${Date.now()}`);
});
