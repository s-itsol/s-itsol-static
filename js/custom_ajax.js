
let _ajaxResponseCallBackFunc = null;								// ajax応答コールバック処理 ※デフォルト：なし

/**
 * ajax応答コールバック初期処理
 * @param func ajax応答コールバック処理
 */
function initAjaxResponseCallBack(func) {

	_ajaxResponseCallBackFunc = func;				// ajax応答コールバック処理
}

function ajaxSyncGet(targetTagId, requestUrl) {
	
	let postFormTagId	= null;					// 送信フォームタグID：なし
	let method			= "GET";				// HTTP要求メソッド：GET
	let isAsync			= false;				// 非同期フラグ：OFF

	// ajax要求
	ajaxRequext(targetTagId, requestUrl, postFormTagId, method, isAsync);
}

function ajaxSyncPost(targetTagId, requestUrl, postFormTagId) {

	let method			= "POST";				// HTTP要求メソッド：POST
	let isAsync			= false;				// 非同期フラグ：OFF

	// ajax要求
	ajaxRequext(targetTagId, requestUrl, postFormTagId, method, isAsync);
}

/**
 * ajax要求
 * @param targetTagId リフレッシュ先タグID
 * @param requestUrl リクエストURL
 * @param postFormTagId POSTフォームタグID
 * @param method HTTP要求メソッド
 * @param isAsync 非同期フラグ
 */
function ajaxRequext(targetTagId, requestUrl, postFormTagId, method, isAsync) {

	// HTTP要求インスタンス生成
	let request = new XMLHttpRequest();
	{
		// イベントハンドラ「load」
		request.onload = function (event) {

			// 操作完了
			if ( request.readyState === 4 ) {

				// 正常応答
				if ( request.status === 200 ) {

					let refreshElm = document.getElementById(targetTagId);				// リフレッシュ先-エレメント

					// リフレッシュ先-エレメントあり
					if ( refreshElm != null ) {

						let refreshHtml = request.response;

						// 応答コールバック処理あり
						if ( _ajaxResponseCallBackFunc != null ) {
							// 応答コールバック処理実行
							refreshHtml = _ajaxResponseCallBackFunc(refreshHtml);

						// 応答コールバック処理なし
						} else {
							// 警告メッセージのログ出力のみ(＝エラーにはしない)
							console.warn("応答コールバック処理の設定がありません。「initAjaxResponseCallBack」を実行し、コールバック処理を設定してください、");
						}

						// 対象HTML書き換え
						refreshElm.innerHTML = refreshHtml;

					// それ以外(＝リフレッシュ先-エレメント無し)
					} else {
						// キー情報付き警告メッセージのログ出力のみ(＝エラーにはしない)
						console.warn("HTTP応答結果のリフレッシュ先-エレメント無し - タグID：[" + targetTagId + "], リクエストURL：[" + requestUrl + "]");
					}

				// それ以外(＝エラー応答)
				} else {
					// キー情報付きメッセージ生成＆例外スロー
					throw new Error("HTTPエラー応答 - HTTPステータス：[" + request.status + "], メッセージ：[" + request.statusText + "], リクエストURL：[" + requestUrl + "]");
				}

			}

		};

		// イベントハンドラ「error」
		request.onerror = function (event) {
			// キー情報付きメッセージ生成＆例外スロー
			//  ※ここは何のエラーでコールバックされるのか、イマイチ不明。要求がまったく送信できなかったときにだけトリガーされる…とか何とか。
			throw new Error("HTTP要求エラー - リクエストURL：[" + requestUrl + "]");
		};

	}

	try {
		// HTTP設定
		request.open(method, requestUrl, isAsync, null, null);

	} catch (ex) {
		// キー情報付きメッセージを生成して例外スロー
		throw new Error("HTTP設定エラー - HTTP要求メソッド：[" + method + "], リクエストURL：[" + requestUrl + "], 非同期フラグ：[" + isAsync + "], エラー情報：[" + ex + "]");
	}

	let isPost = ( method == "POST" );			// POSTフラグ

	// POSTだった場合
	if ( isPost ) {
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	}

	// 送信データ生成
	let sendObj = createSendData(postFormTagId);

	try {
		// リクエスト送信
		request.send(sendObj);

	} catch (ex) {
		// キー情報付きメッセージ生成＆例外スロー
		throw new Error("ajax要求エラー - HTTP要求メソッド：[" + method + "], リクエストURL：[" + requestUrl + "], 非同期フラグ：[" + isAsync + "], 送信データ：[" + sendObj + "], エラー情報：[" + ex + "]");
	}
}

/**
 * 送信データ生成
 * @param formTagId フォームタグID
 * @return 送信データ ※「param1=value1&param2=value2&param3=value3…」形式の可変長文字列
 */
function createSendData(formTagId) {

	// データ生成
	let retObj = null;
	{
		let formElm = document.getElementById(formTagId);		// フォーム-エレメント

		if ( formElm == null ) {
			return retObj;
		}

		// ※IE11が無ければ「URLSearchParams」クラスが使えたので、こちらのシンプル実装で行けた
//		{
//			let formData = new FormData(formElm);
//			let searchParams = new URLSearchParams(formData);

//			retObj = searchParams.toString();
//		}

		// ※IE11互換あり版
		{
			// エンコードパラメータ群生成
			let encodeParams = [];
			{
				let elms = formElm.elements;

				// フォーム内エレメントループ
				for ( let elmIdx = 0; elmIdx < elms.length; elmIdx++ ) {

					let elm = elms[elmIdx];

					// 状態無効は含めない
					if ( elm.disabled ) {
						continue;
					}

					let elmType = elm.type;

					// ラジオボタンの場合、チェック無しは含めない
					if ( elmType == "radio" && !elm.checked ) {
						continue;
					}

					// チェックボックスの場合、チェック無しは含めない
					if ( elmType == "checkbox" && !elm.checked ) {
						continue;
					}

					encodeParams.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) );
				}
			}

			// ※「&」連結、エンコード後の空白を「+」へ置換
			retObj = encodeParams.join('&').replace(/%20/g, '+');
		}
	}

	return retObj;
}

function ajaxAsyncGet(targetTagId, requestUrl) {
	
	let postFormTagId	= null;					// 送信フォームタグID：なし
	let method			= "GET";				// HTTP要求メソッド：GET

	// ajax要求(FetchAPI版)
	ajaxFetch(targetTagId, requestUrl, postFormTagId, method);
}

function ajaxAsyncPost(targetTagId, requestUrl, postFormTagId) {

	let method			= "POST";				// HTTP要求メソッド：POST
	let isAsync			= false;				// 非同期フラグ：OFF

	// ajax要求(FetchAPI版)
	ajaxFetch(targetTagId, requestUrl, postFormTagId, method);
}

/**
 * ajax要求(FetchAPI版)
 * @param targetTagId リフレッシュ先タグID
 * @param requestUrl リクエストURL
 * @param postFormTagId POSTフォームタグID
 * @param method HTTP要求メソッド
 */
function ajaxFetch(targetTagId, requestUrl, postFormTagId, method) {

	let isPost = ( method == "POST" );			// POSTフラグ

	let bodyData = null;
	{
		let formElm = document.getElementById(postFormTagId);		// フォーム-エレメント

		// フォーム-エレメントあり
		if ( formElm != null ) {
			// 送信データ生成
			let formData = new FormData(formElm);
			bodyData = new URLSearchParams(formData);
		}
	}

	let fetchInit = {				// HTTP初期設定
		method: method
		, body: bodyData
		, mode: "cors"
		, cache: "default"
	};

	let fetchRequest = null;		// HTTPリクエスト
	{
		try {
			// HTTPリクエスト生成
			fetchRequest = new Request(requestUrl, fetchInit);

		} catch (ex) {
			// キー情報付きメッセージを生成して例外スロー
			throw new Error("HTTP設定エラー - HTTP要求メソッド：[" + method + "], リクエストURL：[" + requestUrl + "], エラー情報：[" + ex + "]");
		}
	}

	// ※非同期スレッドでもスタックトレースが繋がるよう、事前にインスタンス化してエラーメッセージを設定していく形にしている。
	const ajaxError = new Error();			// エラー情報

	// フェッチ実行
	fetch(fetchRequest)
		.then(
			function(response) {

				// エラーあり
				if ( !response.ok ) {
					// キー情報付きメッセージに差し替えてスロー ※このメッセージはcatch句で使う
					ajaxError.message = "{ HTTPエラー応答 - HTTPステータス：[" + response.status + "], メッセージ：[" + response.statusText + "], リクエストURL：[" + requestUrl + "] }";
					throw ajaxError;
				}

				return response.text();
			}
		)
		.then(
			function(refreshHtml) {

				let refreshElm = document.getElementById(targetTagId);				// リフレッシュ先-エレメント

				// リフレッシュ先-エレメントあり
				if ( refreshElm != null ) {

					// 応答コールバック処理あり
					if ( _ajaxResponseCallBackFunc != null ) {
						// 応答コールバック処理実行
						refreshHtml = _ajaxResponseCallBackFunc(refreshHtml);

					// 応答コールバック処理なし
					} else {
						// 警告メッセージのログ出力のみ(＝エラーにはしない)
						console.warn("応答コールバック処理の設定がありません。「initAjaxResponseCallBack」を実行し、コールバック処理を設定してください、");
					}

					// 対象HTML書き換え
					refreshElm.innerHTML = refreshHtml;

				// それ以外(＝リフレッシュ先-エレメント無し)
				} else {
					// キー情報付き警告メッセージのログ出力のみ(＝エラーにはしない)
					console.warn("HTTP応答結果のリフレッシュ先-エレメント無し - タグID：[" + targetTagId + "], リクエストURL：[" + requestUrl + "]");
				}

			}
		)
		.catch(
			function(ex) {
				// キー情報付きメッセージに差し替えてスロー
				ajaxError.message = "ajax要求エラー - HTTP要求メソッド：[" + method + "], リクエストURL：[" + requestUrl + "], エラー情報：[" + ex + "]";
				throw ajaxError;
			}
		)
	;

}

