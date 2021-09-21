(async () => {
    const {importAll, getScript} = await import(`https://rpgen3.github.io/mylib/export/import.mjs`);
    await getScript('https://code.jquery.com/jquery-3.3.1.min.js');
    const $ = window.$;
    const html = $('body').empty().css({
        'text-align': 'center',
        padding: '1em',
        'user-select': 'none'
    });
    const head = $('<div>').appendTo(html),
          body = $('<div>').appendTo(html),
          foot = $('<div>').appendTo(html);
    const rpgen3 = await importAll([
        'input',
        'css'
    ].map(v => `https://rpgen3.github.io/mylib/export/${v}.mjs`));
    $('<span>').appendTo(head).text('マップチップを分割');
    const isChromaKey = rpgen3.addInputBool(body, {
        label: 'クロマキー',
        save: true
    });
    const hide = $('<div>').appendTo(body).hide();
    const inputColor = rpgen3.addInputStr(hide, {
        label: 'クロマキーする色',
        save: true,
        value: '#007575'
    });
    isChromaKey.elm.on('change', () => isChromaKey() ? hide.show() : hide.hide()).trigger('change');
    $('<input>').appendTo(hide).prop({
        type: 'color'
    }).on('change', ({target}) => inputColor($(target).val()));
    const inputUnit = rpgen3.addSelect(body, {
        label: '分割する幅',
        save: true,
        value: 16,
        list: [16, 32, 64, 128, 256]
    });
    $('<input>').appendTo(body).prop({
        type: 'file',
        accept: 'image/*'
    }).on('change', ({target}) => {
        img.prop('src', URL.createObjectURL(target.files[0])).on('load', () => {
            hImg.width(img.width()).height(img.height());
        });
    });
    const hImg = $('<div>').appendTo(body).css({
        position: 'relative',
        display: 'inline-block'
    });
    const img = $('<img>').appendTo(hImg);
    const cover = $('<div>').appendTo(hImg).css({
        position: 'absolute',
        backgroundColor: 'rgba(255, 0, 0, 0.5)'
    });
    img.on('mousemove', ({offsetX, offsetY}) => {
        const unit = inputUnit(),
              left = (offsetX / unit | 0) * unit,
              top = (offsetY / unit | 0) * unit;
        cover.css({
            left, top,
            width: unit,
            height: unit
        });
    });
    cover.on('click', () => {
        const unit = inputUnit(),
              cv = $('<canvas>').prop({
                  width: unit,
                  height: unit
              }),
              ctx = cv.get(0).getContext('2d');
        ctx.drawImage(
            img.get(0),
            ...[
                cover.css('left'),
                cover.css('top')
            ].map(v => Number(v.match(/[0-9]+/)[0])),
            unit, unit, 0, 0, unit, unit
        );
        if(isChromaKey()) {
            const [_r, _g, _b] = rpgen3.getRGBA(inputColor()),
                  imgData = ctx.getImageData(0, 0, unit, unit),
                  {data} = imgData;
            for(let i = 0; i < data.length; i += 4) {
                const [r, g, b] = data.slice(i, i + 3);
                if(_r === r && _g === g && _b === b) data[i + 3] = 0;
            }
            ctx.putImageData(new ImageData(data, unit, unit), 0, 0);
        }
        $('<a>').prop({
            href: cv.get(0).toDataURL('image/png'),
            download: 'mapChip.png'
        }).get(0).click();
    });
})();
