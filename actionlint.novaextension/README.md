<p align="center">
  <img width="450" src="https://raw.githubusercontent.com/jbergstroem/nova-actionlint/main/actionlint.novaextension/logo.png">
</p>

**nova-actionlint** automatically lints all github actions, then reports errors and warnings in Nova's **Issues** sidebar and the editor gutter.

![A screenshot of Actionlint output from the actionlint test repository](https://raw.githubusercontent.com/jbergstroem/nova-actionlint/main/actionlint.novaextension/screenshot.png)

## Requirements

nova-actionlint requires [actionlint][actionlint] to be available in your `$PATH`. The easiest way to do so is by using [Homebrew][brew]:

```shell
$ brew install actionlint
```

You can optionally download a release directly from [the actionlint releases page][actionlint-releases] (1.6.20 or newer recommended).

## Configuration

You can modify the behavior of this extension by accessing the preference pane in your Extension window. These changes
will be saved alongside your workspace.

- Search path: By default, this plugin will only provide feedback for files in the `.github/workflows` folder. If you want to cover more directories or files, add them with the input form.

## Acknowledgements

The extension more or less is a fork of [shellcheck for Nova][nova-shellcheck]. If you appreciate and use this extension you can
[buy him a coffee][olly-coffee].

[actionlint]: https://github.com/rhysd/actionlint
[actionlint-releases]: https://github.com/rhysd/actionlint/releases
[brew]: https://brew.sh
[nova-shellcheck]: https://github.com/olly/nova-shellcheck
[olly-coffee]: https://www.buymeacoffee.com/ollylegg
