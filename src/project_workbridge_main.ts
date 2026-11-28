/*
Project: project_workbridge + DevStream: project_workbridge_main
Project-Hierarchy: project_workbridge_main (full project)
Description for the Script: This is the main-script for example for the important imports.
Purpose of the Script/Document: The script does important general stuff.
Other Dependencies (Software-Deps): -
Other Dependencies (Other Deps): -
Technical Details: -
Further Documentation: -
Author(s): Christian Knuth
*/

//__ import libraries
import localFont from 'next/font/local';

//__ import other project-files
//-

// (1) general paths for imports
const path_definitionsDate = "../project_files/definitions_data/";

// (2) imported modules; custom modules
// [imported custom modules, with f.e. additions to the previously imported library-codebase]

// (3) imported modules; from outsourced code (of this program)
import type {Locale} from '@/prog_configs/localization_config';

// (4) imported specific project-files: [2+] next-js bundles the font at build time, so declare it outside setup-routine
import photo_ahmed_hassan from "@/media_graphics/ahmed_hassan.jpg";
export const adelaide_font = localFont({src:'../project_files/media_fonts/adelaide_regular.otf',variable:'--font-adelaide',weight:'400', //
style:'normal',display:'swap',adjustFontFallback:false});
export const aboric_font = localFont({src:'../project_files/media_fonts/aboric_regular.otf',variable:'--font-display',weight:'400', //
style:'normal',display:'swap',adjustFontFallback:false});
export const abigail_font = localFont({src:'../project_files/media_fonts/abigail_regular.otf',variable:'--font-body',weight:'400', //
style:'normal',display:'swap',adjustFontFallback:false});
export const valentine_font = localFont({src:'../project_files/media_fonts/valentine_regular.otf',variable:'--font-wordmark',weight:'400', //
style:'normal',display:'swap',adjustFontFallback:false});

const path_messages = {
de: `${path_definitionsDate}contents_de.json`,
en: `${path_definitionsDate}contents_en.json`,
ar: `${path_definitionsDate}contents_ar.json`,
tr: `${path_definitionsDate}contents_tr.json`,
fa: `${path_definitionsDate}contents_fa.json`,
uk: `${path_definitionsDate}contents_uk.json`,
} satisfies Record<Locale,string>;

//__ definitions (defined parameters)
//-

// (1) internal parameters
type Messages = Record<Locale,Awaited<ReturnType<typeof load_messages>>>;
const loaded_messages: Partial<Messages> = {};
let messages: Partial<Messages>;
let demo_cv_photo: string;

//__ function definitions (in this script)
//-

// (1) low level func. implementations
export async function load_messages(locale:Locale)
{
const imported_messages = {
de: () => import("../project_files/definitions_data/contents_de.json"),
en: () => import("../project_files/definitions_data/contents_en.json"),
ar: () => import("../project_files/definitions_data/contents_ar.json"),
tr: () => import("../project_files/definitions_data/contents_tr.json"),
fa: () => import("../project_files/definitions_data/contents_fa.json"),
uk: () => import("../project_files/definitions_data/contents_uk.json"),
} satisfies Record<Locale,() => Promise<{default:unknown}>>;

return (await imported_messages[locale]()).default;
}

// (2) high level func. implementations
// [high level function implementations]

//__ setup routine
export async function setup(): Promise<void>
{
// retrieve all available locales
const locales = Object.keys(path_messages) as Locale[];

// load all message files concurrently
const imported_messages = await Promise.all(locales.map(locale => load_messages(locale)));

// store imported messages
locales.forEach((locale,index) => {
loaded_messages[locale] = imported_messages[index];
});
}

//__ main routine
function main(): void
{
messages = loaded_messages;
demo_cv_photo = photo_ahmed_hassan.src;
}

//__ define script-flow
async function def_scriptFlow(): Promise<void>
{
await setup();
main();
}

//__ script entry-point
await def_scriptFlow();

//__ exports section
export {messages,demo_cv_photo};

// end of script
//~
  
//__ notes and documentation (after the code of the program-script)
//-

// (1) temporary developer-notes
// [temporary notes; maybe f.e. with further relevant informations/infos, that would be too long or irrelevant for the global description-header at the start of the script]

// (2) code-cache
// [code-cache; previously used code or generally code-passages that are probably to be re-used again]