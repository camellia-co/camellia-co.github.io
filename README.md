# camellia-co.github.io

카멜리아(Camellia) 회사 사이트입니다. GitHub Pages 로 https://camellia-co.github.io 에 올라갑니다.

빌드 도구 없이 HTML, CSS, JavaScript 파일만으로 되어 있습니다. `main` 에 올리면 그대로 반영됩니다.

## 구성

| 경로 | 내용 |
|---|---|
| `index.html` | 메인 페이지 |
| `lottory/privacy/index.html` | 로또리 개인정보처리방침 (`/lottory/privacy/`) |
| `lottory/account-deletion/index.html` | 로또리 계정 삭제 안내 (`/lottory/account-deletion/`) |
| `404.html` | 없는 주소로 들어왔을 때 보이는 페이지 |
| `assets/css/site.css` | 모든 페이지가 함께 쓰는 스타일 |
| `assets/js/site.js` | 메인 페이지의 스크롤 연출 (로고의 점 속으로 들어가면 태양계가 나옴) |
| `assets/img/` | 파비콘, 로또리 아이콘, 링크 미리보기 이미지(`og.png`), 문서 페이지용 로고(`logo-on-dark.svg`) |
| `assets/vendor/` | three.js 0.160.0 (MIT 라이선스, `three.LICENSE.txt`) |
| `.nojekyll` | GitHub Pages 가 파일을 가공하지 않고 그대로 올리게 함 |

## 내 컴퓨터에서 보기

파일 경로가 `/assets/...` 처럼 사이트 맨 위를 기준으로 되어 있어서, 파일을 직접 열지 말고 간단한 서버로 띄워야 합니다.

```
python -m http.server 8000
```

그다음 브라우저에서 http://localhost:8000 을 엽니다.

## 고칠 때

- 문구: `index.html`
- 회사 정보: 메인 페이지와 문서 페이지 두 개의 맨 아래에 똑같이 들어 있습니다. 바꿀 때는 세 파일을 함께 고칩니다.
- 행성 추가(새 앱): `assets/js/site.js` 의 `PLANETS` 와 `shades`
- 3D 를 쓸 수 없는 환경에서는 우주가 검은 바탕으로만 보입니다.
- 스크롤 연출과 행성의 움직임은 기기의 '동작 줄이기'(Windows 의 애니메이션 효과 끄기 등) 설정과 상관없이 항상 나옵니다.
- 스크립트가 꺼진 브라우저에서는 연출 없이 한 화면으로 보입니다.

## 문서 페이지 (준비 중)

메인 페이지의 로또리 칸에서 두 페이지로 갈 수 있습니다.

- 개인정보처리방침: 목차와 항목 제목만 있습니다. 내용이 확정되면 각 항목의 안내 문장을 실제 내용으로 바꿉니다.
- 계정 삭제 안내: 초안이 들어 있습니다. 삭제되는 정보, 보관되는 정보, 기간은 로또리 서버의 실제 동작과 같아야 하므로, 탈퇴 기능이 바뀌면 이 페이지도 함께 고칩니다.

내용이 확정된 페이지는 `<meta name="robots" content="noindex">` 줄과 맨 위의 안내(`doc-note`)를 지웁니다.
