import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// The 2D and 3D lessons are separate self-contained pages. These checks keep them telling the same lesson.
const read = (name) => readFileSync(fileURLToPath(new URL(`../../../public/illustrations/${name}`, import.meta.url)), 'utf8')
const pages = {
  '2d dark': read('fpv-drone-lesson-dark.html'),
  '2d light': read('fpv-drone-lesson-light.html'),
  '3d dark': read('fpv-drone-lesson-3d-dark.html'),
  '3d light': read('fpv-drone-lesson-3d-light.html'),
}
const chips = (html) => [...html.matchAll(/<li><button type="button" data-step="(\d+)"><b>(\d+)<\/b>([^<]+)<\/button><\/li>/g)].map((m) => m[3])
const STEPS = ['Plate', 'Arms', 'Motors', 'ESC', 'Flight controller', 'Video TX', 'Camera', 'Top plate', 'Power lead', 'Battery', 'Antennas', 'Props', 'Throttle', 'Yaw', 'Pitch', 'Roll', 'Free flight']

for (const [name, html] of Object.entries(pages)) {
  test(`${name}: seventeen steps, twelve to build and five to fly`, () => {
    assert.deepEqual(chips(html), STEPS)
  })
  test(`${name}: radio, four motor dials, narration and step buttons are present`, () => {
    if (name.startsWith('3d')) {
      assert.match(html, /class="radio3d"/)
    } else {
      assert.match(html, /data-knob="L"/)
      assert.match(html, /data-knob="R"/)
    }
    assert.equal((html.match(/data-cell="\d"/g) || []).length, 4)
    assert.match(html, /data-say-title/)
    assert.match(html, /data-act="play"/)
  })
  test(`${name}: resumes from #s= and reports its step to the page`, () => {
    assert.match(html, /s=\(\[0-9\]\+\)/)
    assert.match(html, /droneLesson:/)
  })
}

test('3d pages draw with three.js and report when WebGL is missing', () => {
  for (const name of ['3d dark', '3d light']) {
    assert.match(pages[name], /<canvas>/)
    assert.match(pages[name], /droneLesson3dUnavailable/)
    assert.match(pages[name], /WebGLRenderer/)
  }
})

test('the 2D page keeps the flight numbers the 3D page is built from', () => {
  for (const name of ['2d dark', '2d light']) {
    const html = pages[name]
    assert.match(html, /HOVER = 0.4/)
    assert.match(html, /LIFT_MAX = 60/)
    assert.match(html, /TILT = 12/)
    assert.match(html, /KP = 0.1, KR = 0.1, KY = 0.08/)
  }
})

test('the 3D pages have a 3D radio and markers for each part', () => {
  for (const name of ['3d dark', '3d light']) {
    assert.match(pages[name], /data-pins/)
    assert.match(pages[name], /class="radio-caps"/)
    assert.equal((pages[name].match(/<canvas>/g) || []).length, 1) // the drone
    assert.equal((pages[name].match(/<canvas aria-label/g) || []).length, 1) // the radio
    assert.match(pages[name], /Math.PI*.5|MAX_TILT|.5*Math.PI|.5/) 
  }
})

test('the 3D pages have the physics lab: four tabs, charts, PID sliders and the laws', () => {
  for (const name of ['3d dark', '3d light']) {
    const html = pages[name]
    assert.match(html, /data-lab /)
    for (const tab of ['live', 'air', 'pid', 'laws']) assert.match(html, new RegExp('data-lab-tab="' + tab + '"'))
    assert.ok((html.match(/data-chart=/g) || []).length >= 12, 'live, air and PID charts')
    assert.equal((html.match(/data-gain=/g) || []).length, 3)
    assert.match(html, /data-laws/)
    assert.match(html, /data-pid-act="gust"/)
  }
})

test('2d and 3d give the same explanation of each stick', () => {
  const lines = [
    'Stick near 40%: thrust equals weight, the drone hovers.',
    'Yaw right: the anticlockwise motors speed up, the clockwise ones slow, the nose turns right.',
    'Pitch forward: rear motors faster, front motors slower, the nose tips down and the drone flies forward.',
    'Roll right: left motors faster, right motors slower, the drone tips right and slides right.',
  ]
  for (const html of Object.values(pages)) for (const line of lines) assert.ok(html.includes(line), line)
})
