import { Rule, Tree, SchematicsException } from '@angular-devkit/schematics';
import { Schema } from '../schema';
import * as messages from '../messages';
import { getProjectTargetOptions } from '../../utils/project';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { workspaces, JsonArray } from '@angular-devkit/core';

// Default styles, assets and script

const SB_STYLES = [
  'node_modules/@project-sunbird/sb-styles/assets/_styles.scss'
];
const SB_ASSETS = [{
  glob: '**/*.*',
  input: './node_modules/@project-sunbird/sunbird-epub-player-v9/lib/assets/',
  output: '/assets/'
}];
const SB_SCRIPTS = [
  'node_modules/epubjs/dist/epub.js'
];


/**
 * we're simply adding styles to the 'angular.json'
 */
export function addPlayerStyles(options: Schema): Rule {
  return async (host: Tree) => {
    const workspace: any = await getWorkspace(host);

    const projectName = options.project || (workspace.extensions.defaultProject as string);
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(messages.noProject(projectName));
    }
    // just patching 'angular.json'
    return addPlayerToAngularJson(workspace, project);
  };
}

/**
 * Patches 'angular.json' to add styles
 */
function addPlayerToAngularJson(
  workspace: any,
  project: workspaces.ProjectDefinition
): Rule {
  const targetOptions = getProjectTargetOptions(project, 'build');
  addStyleToTarget(targetOptions, SB_STYLES);
  addAssetsToTarget(targetOptions, SB_ASSETS);
  addScriptToTarget(targetOptions, SB_SCRIPTS);
  return updateWorkspace(workspace) as unknown as Rule;
}

function addStyleToTarget(targetOptions: any, assetPaths: Array<any>) {
  const styles = (targetOptions.styles as JsonArray | undefined);
  if (!styles) {
    targetOptions.styles = assetPaths;
  } else {
    const existingStyles: any = styles.map((s: any) => typeof s === 'string' ? s : s.input);
    assetPaths.forEach((style: any) => {
      if (!existingStyles.includes(typeof style === 'string' ? style : style.input)) {
        styles.unshift(style);
      }
    });
  }
}

function addAssetsToTarget(targetOptions: any, assetPaths: Array<any>) {
  const assets = (targetOptions.assets as JsonArray | undefined);
  if (!assets) {
    targetOptions.assets = assetPaths;
  } else {
    const existingAssets: any = assets.map((s: any) => typeof s === 'string' ? s : s.input);
    assetPaths.forEach((asset: any) => {
      if (!existingAssets.includes(typeof asset === 'string' ? asset : asset.input)) {
        assets.unshift(asset);
      }
    });
  }
}

function addScriptToTarget(targetOptions: any, assetPaths: Array<any>) {
  const scripts = (targetOptions.scripts as JsonArray | undefined);
  if (!scripts) {
    targetOptions.scripts = assetPaths;
  } else {
    const existingScripts: any = scripts.map((s: any) => typeof s === 'string' ? s : s.input);
    assetPaths.forEach((script: any) => {
      if (!existingScripts.includes(typeof script === 'string' ? script : script.input)) {
        scripts.unshift(script);
      }
    });
  }
}
