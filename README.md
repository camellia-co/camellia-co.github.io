# camellia-co.github.io

카멜리아(Camellia) 회사 사이트입니다. GitHub Pages 로 https://camellia-co.github.io 에 올라갑니다.

빌드 도구 없이 HTML, CSS, JavaScript 파일만으로 되어 있습니다. `main` 에 올리면 그대로 반영됩니다.

## 구성

| 경로 | 내용 |
|---|---|
| `index.html` | 메인 페이지 |
| `404.html` | 없는 주소로 들어왔을 때 보이는 페이지 |
| `assets/css/site.css` | 모든 페이지가 함께 쓰는 스타일 |
| `assets/js/site.js` | 메인 페이지의 스크롤 연출 (로고의 점 속으로 들어가면 태양계가 나옴) |
| `assets/img/` | 파비콘, 로또리 아이콘, 링크 미리보기 이미지(`og.png`) |
| `assets/vendor/` | three.js 0.160.0 (MIT 라이선스, `three.LICENSE.txt`) |
| `.nojekyll` | GitHub Pages 가 파일을 가공하지 않고 그대로 올리게 함 |

## 내 컴퓨터에서 보기

파일 경로가 `/assets/...` 처럼 사이트 맨 위를 기준으로 되어 있어서, 파일을 직접 열지 말고 간단한 서버로 띄워야 합니다.

```
python -m http.server 8000
```

그다음 브라우저에서 http://localhost:8000 을 엽니다.

## 고칠 때

- 문구와 회사 정보: `index.html`
- 행성 추가(새 앱): `assets/js/site.js` 의 `PLANETS` 와 `shades`
- 3D 를 쓸 수 없는 환경에서는 우주가 검은 바탕으로만 보입니다.
- 기기에서 '동작 줄이기'(Windows 의 애니메이션 효과 끄기 등)를 켠 경우에는 스크롤 연출은 그대로 나오고, 행성이 스스로 도는 움직임만 멈춥니다.
- 스크립트가 꺼진 브라우저에서는 연출 없이 한 화면으로 보입니다.
