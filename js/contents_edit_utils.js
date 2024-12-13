
/**
 * 共通ヘッダ読込み
 */
function loadCommonHeader() {

	// ajax応答コールバック初期処理
	initAjaxResponseCallBack(
		function(html) {
			// HTML文字列をパースしてDOMオブジェクトを作成
			const parser = new DOMParser();
			const htmlDoc = parser.parseFromString(html, "text/html");

			// トップページから共通ヘッダの要素を取得
			const commonHeaderElement = htmlDoc.getElementById("divCommonHeader");

			// 共通ヘッダのHTMLを取得
			const retHtml = commonHeaderElement ? commonHeaderElement.innerHTML : null;

			return retHtml;
		}
	);

	// トップページをajax-GETリクエスト
	ajaxAsyncGet("divCommonHeader", "/index.html");
}
