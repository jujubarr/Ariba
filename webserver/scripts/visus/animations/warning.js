var WarningAnim = ring.create([AnimationClass], {
    draw: function()
    {
        var alpha = 256, x = 775;

        // for the first 100 iterations, adjust the alpha of the
        // background color
        if (100 > this.time) {
            alpha = 256 * this.time / 100;
            x = (775 - 250) + 250 * this.time / 100;
        }

    },

    finished: function()
    {
        return false;
    },

    name: 'Warning Animation',
});