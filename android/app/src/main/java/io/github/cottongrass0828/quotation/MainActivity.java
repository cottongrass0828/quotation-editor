package io.github.cottongrass0828.quotation;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 估價單是固定版型的單據，不應該跟著使用者手機的系統字型大小設定縮放，
        // 否則同一份 HTML/CSS 在不同手機上会因為系統字型大小不同而跑版
        // （包含畫面 UI 和 html2canvas 截圖的離屏內容）。
        this.bridge.getWebView().getSettings().setTextZoom(100);
    }
}
