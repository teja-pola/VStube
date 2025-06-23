// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

class YouTubeViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: []
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// Handle messages from the webview
		webviewView.webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'search':
					try {
						const apiKey = vscode.workspace.getConfiguration('youtubeInVSCode').get('apiKey');
						if (!apiKey) {
							const response = await vscode.window.showInformationMessage(
								'YouTube API Key is required. Would you like to set it up now?',
								'Yes',
								'No'
							);

							if (response === 'Yes') {
								vscode.commands.executeCommand('workbench.action.openSettings', 'youtubeInVSCode.apiKey');
							}
							return;
						}

						const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
							params: {
								part: 'snippet',
								maxResults: 50,
								q: message.query,
								key: apiKey,
								type: 'video',
								pageToken: message.pageToken || ''
							}
						});
						this._view?.webview.postMessage({
							command: 'searchResults',
							results: response.data.items,
							nextPageToken: response.data.nextPageToken,
							totalResults: response.data.pageInfo.totalResults
						});
					} catch (error) {
						vscode.window.showErrorMessage('Failed to search YouTube: ' + error);
					}
					break;
				case 'getTrending':
					try {
						const apiKey = vscode.workspace.getConfiguration('youtubeInVSCode').get('apiKey');
						if (!apiKey) {
							const response = await vscode.window.showInformationMessage(
								'YouTube API Key is required. Would you like to set it up now?',
								'Yes',
								'No'
							);

							if (response === 'Yes') {
								vscode.commands.executeCommand('workbench.action.openSettings', 'youtubeInVSCode.apiKey');
							}
							return;
						}

						const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
							params: {
								part: 'snippet,statistics',
								chart: 'mostPopular',
								maxResults: 50,
								key: apiKey,
								regionCode: 'US'
							}
						});
						this._view?.webview.postMessage({
							command: 'trendingResults',
							results: response.data.items,
							nextPageToken: response.data.nextPageToken,
							totalResults: response.data.pageInfo.totalResults
						});
					} catch (error) {
						vscode.window.showErrorMessage('Failed to fetch trending videos: ' + error);
					}
					break;
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const csp = `
			default-src 'none';
			img-src https: data:;
			style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com;
			font-src https://fonts.googleapis.com https://fonts.gstatic.com;
			script-src ${webview.cspSource} 'unsafe-inline';
			frame-src https://www.youtube.com https://www.youtube-nocookie.com;
		`;

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="Content-Security-Policy" content="${csp}">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>YouTube in VS Code</title>
			<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
			<style>
				:root {
					font-size: 16px;
					--yt-spec-base-background: #0f0f0f;
					--yt-spec-text-primary: #fff;
					--yt-spec-text-secondary: #aaa;
					--yt-spec-brand-background-solid: #212121;
					--yt-spec-brand-background-primary: rgba(33, 33, 33, 0.98);
					--yt-spec-brand-background-secondary: rgba(33, 33, 33, 0.95);
					--yt-spec-general-background-a: #181818;
					--yt-spec-call-to-action: #3ea6ff;
					--yt-spec-text-primary-inverse: #0f0f0f;
					--yt-spec-brand-link-text: #ff0000;
					--yt-spec-textbox-background: #121212;
					--yt-spec-text-input-field-suggestion-highlight-background: #263850;
					--yt-spec-call-to-action-inverse: #065fd4;
					--yt-spec-brand-icon-inactive: #fff;
					--yt-spec-brand-icon-active: #fff;
					--yt-spec-brand-button-background: #c00;
					--yt-spec-brand-link-text: #ff0000;
					--yt-spec-filled-button-focus-outline: rgba(0, 0, 0, 0.6);
					--yt-spec-call-to-action-button-focus-outline: rgba(62, 166, 255, 0.3);
				}

				body {
					background: var(--yt-spec-base-background);
					color: var(--yt-spec-text-primary);
					padding: 0;
					margin: 0;
					height: 100vh;
					display: flex;
					flex-direction: column;
					font-family: 'Roboto', sans-serif;
					font-size: 14px;
					line-height: 1.4;
					overflow: hidden;
				}

				.header {
					position: sticky;
					top: 0;
					z-index: 100;
					background: var(--yt-spec-base-background);
					padding: 8px;
					border-bottom: 1px solid rgba(255, 255, 255, 0.1);
				}

				.top-bar {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					margin-bottom: 0.5rem;
				}

				.logo-container {
					display: flex;
					align-items: center;
					gap: 0;
					color: #fff;
					text-decoration: none;
					flex-shrink: 0;
					margin: 0;
					padding: 0;
				}

				.logo-container svg {
					width: 2rem;
					height: 2rem;
					fill: currentColor;
					margin: 0;
					padding: 0;
					display: block;
				}

				.search-container {
					display: flex;
					flex: 1;
					min-width: 0;
					height: 2rem;
					margin: 0;
					padding: 0;
				}

				.search-container input {
					flex: 1;
					min-width: 0;
					padding: 0 0.75rem;
					background: var(--yt-spec-textbox-background);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 1.25rem 0 0 1.25rem;
					color: var(--yt-spec-text-primary);
					font-size: 1rem;
					outline: none;
					height: 2rem;
				}

				.search-container input:focus {
					border-color: var(--yt-spec-call-to-action);
				}

				.search-container button {
					width: 2.5rem;
					height: 2rem;
					background: var(--yt-spec-brand-background-solid);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-left: none;
					border-radius: 0 1.25rem 1.25rem 0;
					color: var(--yt-spec-text-primary);
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0;
				}

				.search-container button:hover {
					background: #303030;
				}

				.filter-container {
					display: flex;
					gap: 8px;
					overflow-x: auto;
					padding: 4px 0;
					scrollbar-width: none;
					-ms-overflow-style: none;
				}

				.filter-container::-webkit-scrollbar {
					display: none;
				}

				.filter-chip {
					background: var(--yt-spec-brand-background-solid);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 16px;
					color: var(--yt-spec-text-primary);
					padding: 4px 12px;
					font-size: 14px;
					white-space: nowrap;
					cursor: pointer;
					transition: background-color 0.2s;
				}

				.filter-chip:hover {
					background: #303030;
				}

				.filter-chip.active {
					background: var(--yt-spec-text-primary);
					color: var(--yt-spec-text-primary-inverse);
				}

				#active-video {
					width: 100%;
					background: #000;
					aspect-ratio: 16/9;
					border: none;
					display: none;
				}

				#active-video.visible {
					display: block;
				}

				.content-container {
					flex: 1;
					overflow-y: auto;
					padding: 16px;
					scrollbar-width: thin;
					scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
				}

				.content-container::-webkit-scrollbar {
					width: 8px;
				}

				.content-container::-webkit-scrollbar-track {
					background: transparent;
				}

				.content-container::-webkit-scrollbar-thumb {
					background-color: rgba(255, 255, 255, 0.3);
					border-radius: 4px;
				}

				.video-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
					gap: 16px;
				}

				.video-item {
					cursor: pointer;
					transition: transform 0.2s;
				}

				.video-item:hover {
					transform: scale(1.02);
				}

				.thumbnail-container {
					position: relative;
					width: 100%;
					padding-top: 56.25%;
					background: var(--yt-spec-brand-background-solid);
					border-radius: 8px;
					overflow: hidden;
				}

				.thumbnail {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.duration {
					position: absolute;
					bottom: 4px;
					right: 4px;
					background: rgba(0, 0, 0, 0.8);
					color: #fff;
					padding: 2px 4px;
					border-radius: 2px;
					font-size: 12px;
				}

				.video-info {
					padding: 8px 0;
				}

				.video-title {
					font-weight: 500;
					margin-bottom: 4px;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}

				.channel-name {
					color: var(--yt-spec-text-secondary);
					font-size: 13px;
					margin-bottom: 2px;
				}

				.video-meta {
					color: var(--yt-spec-text-secondary);
					font-size: 13px;
					display: flex;
					gap: 4px;
				}

				.loading {
					text-align: center;
					padding: 16px;
					color: var(--yt-spec-text-secondary);
				}

				@media (max-width: 480px) {
					.video-grid {
						grid-template-columns: 1fr;
					}

					.search-container input {
						font-size: 16px;
					}
				}
			</style>
		</head>
		<body>
			<div class="header">
				<div class="top-bar">
					<div class="logo-container">
						<svg viewBox="0 0 30 20">
							<g viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet">
								<g>
									<path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"></path>
									<path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"></path>
								</g>
							</g>
						</svg>
					</div>
					<div class="search-container">
						<input type="text" id="searchInput" placeholder="Search">
						<button onclick="searchVideos()">
							<svg height="24" viewBox="0 0 24 24" width="24" focusable="false">
								<path d="M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"></path>
							</svg>
						</button>
					</div>
				</div>
				<div class="filter-container">
					<div class="filter-chip active">All</div>
					<div class="filter-chip">Music</div>
					<div class="filter-chip">Gaming</div>
					<div class="filter-chip">Live</div>
					<div class="filter-chip">News</div>
					<div class="filter-chip">Sports</div>
					<div class="filter-chip">Learning</div>
					<div class="filter-chip">Fashion</div>
				</div>
			</div>

			<iframe id="active-video" frameborder="0" allowfullscreen></iframe>

			<div class="content-container">
				<div id="results" class="video-grid"></div>
				<div id="loading" class="loading" style="display: none;">Loading more videos...</div>
			</div>

			<script>
				const vscode = acquireVsCodeApi();
				let nextPageToken = '';
				let isLoading = false;
				let currentQuery = '';
				
				// Load trending videos on startup
				window.addEventListener('load', () => {
					document.getElementById('loading').style.display = 'block';
					vscode.postMessage({ command: 'getTrending' });
				});

				function searchVideos(pageToken = '') {
					const query = document.getElementById('searchInput').value;
					if (!pageToken) {
						currentQuery = query;
						document.getElementById('results').innerHTML = '';
						window.scrollTo(0, 0);
					}
					
					if (query === currentQuery || pageToken) {
						isLoading = true;
						document.getElementById('loading').style.display = 'block';
						vscode.postMessage({
							command: 'search',
							query: currentQuery || query,
							pageToken: pageToken
						});
					}
				}

				document.getElementById('searchInput').addEventListener('keypress', (e) => {
					if (e.key === 'Enter') {
						searchVideos();
					}
				});

				function formatDate(isoDate) {
					const date = new Date(isoDate);
					const now = new Date();
					const diff = now.getTime() - date.getTime();
					
					const minute = 60 * 1000;
					const hour = minute * 60;
					const day = hour * 24;
					const week = day * 7;
					const month = day * 30;
					const year = day * 365;
					
					if (diff < hour) {
						const mins = Math.floor(diff / minute);
						return \`\${mins} minute\${mins === 1 ? '' : 's'} ago\`;
					} else if (diff < day) {
						const hours = Math.floor(diff / hour);
						return \`\${hours} hour\${hours === 1 ? '' : 's'} ago\`;
					} else if (diff < week) {
						const days = Math.floor(diff / day);
						return \`\${days} day\${days === 1 ? '' : 's'} ago\`;
					} else if (diff < month) {
						const weeks = Math.floor(diff / week);
						return \`\${weeks} week\${weeks === 1 ? '' : 's'} ago\`;
					} else if (diff < year) {
						const months = Math.floor(diff / month);
						return \`\${months} month\${months === 1 ? '' : 's'} ago\`;
					} else {
						const years = Math.floor(diff / year);
						return \`\${years} year\${years === 1 ? '' : 's'} ago\`;
					}
				}

				function formatViews(viewCount) {
					if (viewCount >= 1000000) {
						return \`\${Math.floor(viewCount / 1000000)}M views\`;
					} else if (viewCount >= 1000) {
						return \`\${Math.floor(viewCount / 1000)}K views\`;
					} else {
						return \`\${viewCount} views\`;
					}
				}

				function playVideo(videoId) {
					const player = document.getElementById('active-video');
					player.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1\`;
					player.classList.add('visible');
					window.scrollTo(0, 0);
				}

				// Handle filter chips
				document.querySelectorAll('.filter-chip').forEach(chip => {
					chip.addEventListener('click', () => {
						document.querySelector('.filter-chip.active').classList.remove('active');
						chip.classList.add('active');
						// TODO: Implement filter functionality
					});
				});

				// Infinite scrolling
				document.querySelector('.content-container').addEventListener('scroll', (e) => {
					if (isLoading) return;
					
					const {scrollTop, scrollHeight, clientHeight} = e.target;
					if (scrollTop + clientHeight >= scrollHeight - 100 && nextPageToken) {
						searchVideos(nextPageToken);
					}
				});

				window.addEventListener('message', event => {
					const message = event.data;
					switch (message.command) {
						case 'searchResults':
						case 'trendingResults':
							isLoading = false;
							document.getElementById('loading').style.display = 'none';
							nextPageToken = message.nextPageToken;
							
							const resultsContainer = document.getElementById('results');
							if (!message.pageToken) {
								resultsContainer.innerHTML = '';
							}

							message.results.forEach(video => {
								const videoElement = document.createElement('div');
								videoElement.className = 'video-item';
								videoElement.onclick = () => playVideo(video.id.videoId || video.id);
								
								const viewCount = video.statistics ? formatViews(video.statistics.viewCount) : '';
								
								videoElement.innerHTML = \`
									<div class="thumbnail-container">
										<img class="thumbnail" src="\${video.snippet.thumbnails.high.url}" alt="\${video.snippet.title}">
										<div class="duration"></div>
									</div>
									<div class="video-info">
										<div class="video-title">\${video.snippet.title}</div>
										<div class="channel-name">\${video.snippet.channelTitle}</div>
										<div class="video-meta">
											\${viewCount ? \`<span>\${viewCount}</span> • \` : ''}
											<span>\${formatDate(video.snippet.publishedAt)}</span>
										</div>
									</div>
								\`;
								
								resultsContainer.appendChild(videoElement);
							});
							break;
					}
				});
			</script>
		</body>
		</html>`;
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('YouTube in VS Code is now active!');

	const sidebarProvider = new YouTubeViewProvider(context.extensionUri);
	const explorerProvider = new YouTubeViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('youtube-sidebar', sidebarProvider),
		vscode.window.registerWebviewViewProvider('youtube-explorer', explorerProvider)
	);

	let disposable = vscode.commands.registerCommand('youtube-in-vs-code.openYouTube', () => {
		vscode.commands.executeCommand('workbench.view.extension.youtube-sidebar-view');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
