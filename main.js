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
    $('<input>').appendTo(body).prop({
        type: 'file',
        accept: 'image/*'
    }).on('change', ({target}) => {
        img.prop('src', URL.createObjectURL(target.files[0]));
    });
    const hImg = $('<div>').appendTo(body).css({
        position: 'relative'
    });
    const img = $('<img>').appendTo(hImg);
    const cover = $('<div>').appnedTo(hImg).css({
        position: 'absolute',
        outline: '3px #4ec4d3',
        'outline-offset': '-3px'
    });
    const inputColor = rpgen3.addInputStr(body, {
        label: '透過する色',
        save: true,
        value: '#007575'
    });
    $('<input>').appendTo(body).prop({
        type: 'color'
    }).on('change', ({target}) => inputColor($(target).val()));
    const inputUnit = rpgen3.addSelect(body, {
        label: '分割する幅',
        save: true,
        value: 16,
        list: [16, 32, 64, 128, 256]
    });
    img.on('hover', ({offsetX, offsetY}) => {
        const unit = inputUnit(),
              left = (offsetX / unit | 0) * unit,
              top = (offsetY / unit | 0) * unit;
        cover.css({
            top, left,
            width: unit,
            height: unit
        });
    });
    img.on('click', ({offsetX, offsetY}) => {
        const unit = inputUnit(),
              left = (offsetX / unit | 0) * unit,
              top = (offsetY / unit | 0) * unit,
              cv = $('<canvas>').prop({
                  width: unit,
                  height: unit
              }),
              ctx = cv.get(0).getContext('2d');
        ctx.drawImage(img.get(0), top, left, unit, unit, 0, 0, unit, unit);
        $('<a>').prop({
            href: cv.get(0).toDataURL('image/png'),
            download: 'mapChip.png'
        }).get(0).click();
    });
})();
