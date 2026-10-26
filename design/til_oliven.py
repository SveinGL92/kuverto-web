"""Gjør en Blåmalt-artboard (N-*.dc.html) om til endelig Oliven-versjon (O-*.dc.html)."""
import re, sys
FARGER = {
    '#1F3C88': '#2E3A12', '#172C66': '#1F280B', '#E7ECF8': '#ECEBCF', '#DDE3F7': '#DDE3C6',
    '#F2B33D': '#E2E66A', '#15182A': '#1C2210', '#5A5F73': '#5F6152', '#FAFAF7': '#F6F4EA',
    '#DADDE6': '#DEDCCB', '#8A91A8': '#8A8770', '#EEF0F5': '#EEECDD', '#3B3F52': '#3C4130',
    '#C9CDDB': '#D3D6C4', '#3E5AA6': '#4A5726', '#E4E6EC': '#E6E4D6',
    'rgba(21,24,42,': 'rgba(28,34,16,',
}
BLOBS = {
    '5663019f8d1180c24b9434c2fc7e076e': 'e1aec7e54b9b2ee0b44231e9a86a1b1c', '02f57337bb209b8e7ec78c3486863f79': 'ae0abeed72f6c2afeb7e4b15250c07e6',
    '56015a5caf6606a7a7c4b84f70018302': 'e4edced378ec39e4863a5ee51845b4a6', '8f55cad13e2dc97f7b023571d225a7ce': '20e3861eaa1e140661910b8a51db2eea',
    '490052e5cfcc19ff91137e46df117704': '25e1dc3d68aafb8caac69367806ffa8c', '7d1b510476b6217fd5bcf349ab1f58df': '235974ead4ecce25c03ba9b0a3c70f11',
    'd9f7418bcc2f47e9a77a77b6c68e0447': '910bef29d84a55de51a067d6c1d00142', 'c311f3d77519a5e360aa3c27a077bc84': '0637fcfb657d23f070ba5a5f097459bb',
    'e073a6e8a4726f2235cad2a0eb385c1f': '7241d7b8880e50decff8bc0a97a5b237', 'cdafa7bb91df36e3c17c77584abc214b': 'bd6982678aa0ba752cb00b3b78b904a1',
    '413c1cb773fdb078a563b1e52b2c5202': 'ec8037e9010fc8da41ccd62c33364c84', '30ed27ffd34cfe858ef3d7358fad0d28': 'be688664abe7112ef47930fa8032fc2b',
    '692b540329d159192ffc87ae62d3c8b4': '3d57df322bdcc034e19d37e2b51bc2d2', 'db8754e0259bb8989ff24d6c6d971b97': '97dcdc3bbcb2c0c043f430cb12bc41a3',
    '5059c194e6a67d06bb4666f4d7ffea7a': '66621412f7c9679758537387af6db0c5', 'f72dc3ee2b68e5ead0e7e926c774ebe8': '03f8a783c622a380bdef9822afdaaa7b',
    '2cf42ee20b7eb0d4b01b3e5c0bce6b98': '42d44b739a2dea3f08d0831763a1db26', '66cc02d9cd8ad9b11a547a874c1a66ee': '42d44b739a2dea3f08d0831763a1db26',
}
def kuvert(farge, w):
    return (f'<svg width="{w}" height="{w}" viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="11" width="5" height="26" rx="2.5" fill="{farge}"></rect>'
            f'<rect x="40" y="11" width="5" height="26" rx="2.5" fill="{farge}"></rect><circle cx="24" cy="24" r="10.5" fill="none" stroke="{farge}" stroke-width="5"></circle></svg>')
def gjor(s):
    # porselenssymbolet -> kuvert-symbolet
    s = re.sub(r'<svg width="(\d+)" height="\d+" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="(#[0-9A-Fa-f]{6})">.*?</svg>',
               lambda m: kuvert(m.group(2), m.group(1)), s, flags=re.S)
    s = s.replace("family=Familjen+Grotesk:wght@400..700", "family=Manrope:wght@500..800")
    s = s.replace("'Familjen Grotesk', sans-serif", "Manrope, sans-serif")
    s = re.sub(r"(font-family: Manrope, sans-serif;[^\"]*?font-weight: )600", r"\g<1>800", s)
    s = re.sub(r"(font-family: Manrope, sans-serif;[^\"]*?font-weight: )700", r"\g<1>800", s)
    s = re.sub(r"(<h[12] style=\"[^\"]*?font-family: Manrope[^\"]*?letter-spacing: )-0\.0[23]\d*em", r"\g<1>-0.045em", s)
    for a, b in FARGER.items():
        s = s.replace(a, b)
    for a, b in BLOBS.items():
        s = s.replace(a, b)
    # moderne form: piller på knapper og merker, 14 px på felt, runde kort og bildeflater
    s = re.sub(r'(<(?:button|a)\b[^>]*?)border-radius: 6px', r'\1border-radius: 999px', s)
    s = re.sub(r'(<(?:input|select|textarea)\b[^>]*?)border-radius: 6px', r'\1border-radius: 14px', s)
    s = s.replace('border-radius: 6px', 'border-radius: 999px')
    s = re.sub(r'<article style="([^"]*?)border-top: 6px solid #[0-9A-Fa-f]{6};', r'<article style="\1border-radius: 28px; border: 1px solid #DEDCCB;', s)
    s = re.sub(r'<article style="(?![^"]*border-radius)', '<article style="border-radius: 24px; ', s)
    s = re.sub(r'(<div data-foto="[^"]*"[^>]*style=")(?![^"]*border-radius)', r'\1border-radius: 24px; overflow: hidden; ', s)
    s = s.replace('Kuverto Blåmalt', 'Kuverto')
    return s
for src, dst in zip(sys.argv[1::2], sys.argv[2::2]):
    open(dst, 'w').write(gjor(open(src).read()))
    print(dst)
