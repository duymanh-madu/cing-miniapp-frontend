import * as T from "three";
export function installInspection(ctx) {
  const { renderer, camera, scene, ui, status } = ctx;
  const panel = document.createElement("fieldset");
  panel.innerHTML =
    '<legend>Kiểm tra cận cảnh V34 · cục bộ</legend><button id="audit-current">Chụp bộ đang mặc</button><button id="audit-all">Chụp cả sáu bộ</button><button id="audit-mix">Kiểm tra phối chéo</button><p id="audit-status">Chưa chạy</p>';
  document.querySelector("main").appendChild(panel);
  const label = panel.querySelector("#audit-status");
  async function capture(character, style, motion) {
    const mixed = motion === "mix";
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 2080;
    const g = canvas.getContext("2d");
    g.fillStyle = "#eee8df";
    g.fillRect(0, 0, 1920, 2080);
    g.fillStyle = "#342b27";
    g.font = "bold 30px sans-serif";
    g.fillText(
      `${character} / ${style} / ${motion ? "POSES" : "CLOSE VIEWS"} / V34`,
      20,
      40,
    );
    const views = mixed
      ? ["campus", "royal", "street"].flatMap((bottom) =>
          [
            ["waist-high", "idle", 0, 0.8, 0.7, 1.0, 1.5],
            ["ankles-low", "idle", 0, 2.4, -0.2, 0.3, 1.5],
            ["seat-low", "seat", 0, 2.4, -0.5, 0.9, 2.7],
            ["walk-side", "walk", 0.5, 1.57, 0.1, 0.9, 2.7],
          ].map((view) => [bottom + " " + view[0], ...view.slice(1), bottom]),
        )
      : motion
        ? [
            ["wave-front", "wave", 0.5, 0, 0, 1.05, 2.7],
            ["wave-back", "wave", 0.5, Math.PI, 0, 1.05, 2.7],
            ["wave-high", "wave", 0.12, 0.8, 0.65, 1.15, 2.3],
            ["wave-low", "wave", 0.85, -0.8, -0.45, 1.15, 2.3],
            ["walk-front", "walk", 0.25, 0, 0.1, 0.9, 2.7],
            ["walk-back", "walk", 0.75, Math.PI, 0.1, 0.9, 2.7],
            ["walk-left", "walk", 0.5, 1.57, 0.1, 0.9, 2.7],
            ["walk-right", "walk", 0, -1.57, 0.1, 0.9, 2.7],
            ["seat-front", "seat", 0, 0, 0.1, 0.9, 2.7],
            ["seat-side", "seat", 0, 1.57, 0.1, 0.9, 2.7],
            ["seat-high", "seat", 0, -0.8, 0.8, 0.9, 2.7],
            ["seat-low", "seat", 0, 2.4, -0.5, 0.9, 2.7],
          ]
        : [
            ["chest-front", "idle", 0, 0, 0.1, 1.3, 1.1],
            ["chest-back", "idle", 0, Math.PI, 0.1, 1.3, 1.1],
            ["chest-high", "idle", 0, 0.8, 0.8, 1.3, 1.1],
            ["chest-low", "idle", 0, -0.8, -0.65, 1.3, 1.1],
            ["waist-front", "idle", 0, 0, 0.7, 1.0, 0.85],
            ["waist-back", "idle", 0, Math.PI, 0.7, 1.0, 0.85],
            ["waist-side", "idle", 0, 1.57, -0.3, 1.0, 1.0],
            ["wrists", "idle", 0, 0, 0, 1.27, 2.1],
            ["ankle-front", "idle", 0, 0, 0.2, 0.2, 1.0],
            ["ankle-back", "idle", 0, Math.PI, 0.2, 0.2, 1.0],
            ["whole-high", "idle", 0, 0.8, 0.85, 0.95, 3.0],
            ["whole-low", "idle", 0, 2.4, -0.55, 0.95, 3.0],
          ];
    const oldSize = renderer.getSize(new T.Vector2()),
      oldRatio = renderer.getPixelRatio(),
      oldPos = camera.position.clone(),
      oldQuaternion = camera.quaternion.clone(),
      oldAspect = camera.aspect;
    renderer.setPixelRatio(1);
    renderer.setSize(640, 640, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    for (let i = 0; i < views.length; i++) {
      const [name, pose, phase, az, el, y, d, bottom] = views[i];
      if (mixed) {
        ui.bottom.value = bottom;
        await ctx.fit();
      }
      ctx.play(pose === "seat" ? "idle" : pose);
      const action = ctx.getActions()[pose === "seat" ? "idle" : pose],
        mixer = ctx.getMixer();
      mixer.stopAllAction();
      action.reset().play();
      action.time = phase * action.getClip().duration;
      action.paused = true;
      mixer.update(0);
      ctx.freeze();
      if (pose === "seat") ctx.seat();
      if (pose === "seat") {
        const { applyPlazaSeatedPose } =
          await import("../features/plaza/scene/plazaSeatedPoseV3.js");
        applyPlazaSeatedPose(ctx.getActor());
      }
      ctx.getActor().update(0);
      scene.updateMatrixWorld(true);
      camera.position.set(
        Math.sin(az) * Math.cos(el) * d,
        y + Math.sin(el) * d,
        Math.cos(az) * Math.cos(el) * d,
      );
      camera.lookAt(0, y, 0);
      renderer.render(scene, camera);
      const col = i % 3,
        row = Math.floor(i / 3);
      g.drawImage(
        renderer.domElement,
        col * 640 + 80,
        60 + row * 505,
        480,
        480,
      );
      g.fillStyle = "#fffdf6";
      g.fillRect(col * 640, 60 + row * 505, 640, 30);
      g.fillStyle = "#222";
      g.font = "22px sans-serif";
      g.fillText(name, col * 640 + 12, 84 + row * 505);
    }
    renderer.setPixelRatio(oldRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    camera.position.copy(oldPos);
    camera.quaternion.copy(oldQuaternion);
    camera.aspect = oldAspect;
    camera.updateProjectionMatrix();
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    const response = await fetch(
      `http://127.0.0.1:5216/capture/${character}-${style}-${mixed ? "mix" : motion ? "motion" : "close"}-v34.png`,
      { method: "POST", headers: { "Content-Type": "image/png" }, body: blob },
    );
    if (!response.ok) throw Error("Save proof failed");
  }
  async function run(all) {
    panel.querySelectorAll("button").forEach((b) => (b.disabled = true));
    try {
      const recipes = all
        ? ["boy", "girl"].flatMap((sex) =>
            ["campus", "royal", "street"].map((style) => [sex, style]),
          )
        : [[ui.gender.value, ui.outfit.value]];
      for (const [sex, style] of recipes) {
        label.textContent = `Đang kiểm tra ${sex} ${style}`;
        if (ui.gender.value !== sex) {
          ui.gender.value = sex;
          await ctx.change();
        }
        ui.outfit.value = style;
        for (const key of ["top", "bottom", "shoes"]) ui[key].value = style;
        await ctx.fit();
        for (const motion of [false, true]) await capture(sex, style, motion);
      }
      label.textContent = `Đã lưu ${recipes.length * 24} góc/khung hình`;
      status.textContent = "Ảnh kiểm tra đã lưu · V34";
    } catch (e) {
      label.textContent = "Lỗi: " + e.message;
    } finally {
      panel.querySelectorAll("button").forEach((b) => (b.disabled = false));
    }
  }
  panel.querySelector("#audit-mix").onclick = async () => {
    panel.querySelectorAll("button").forEach((b) => (b.disabled = true));
    try {
      for (const sex of ["boy", "girl"]) {
        if (ui.gender.value !== sex) {
          ui.gender.value = sex;
          await ctx.change();
        }
        for (const top of ["campus", "royal", "street"])
          for (const shoes of ["campus", "royal", "street"]) {
            label.textContent = `Phối chéo ${sex} ${top} ${shoes}`;
            ui.top.value = top;
            ui.shoes.value = shoes;
            await capture(sex, top + "-" + shoes, "mix");
          }
      }
      label.textContent = "Đã lưu 54 tổ hợp × 4 góc = 216 ảnh";
    } catch (e) {
      label.textContent = "Lỗi: " + e.message;
    } finally {
      panel.querySelectorAll("button").forEach((b) => (b.disabled = false));
    }
  };
  panel.querySelector("#audit-current").onclick = () => run(false);
  panel.querySelector("#audit-all").onclick = () => run(true);
}
