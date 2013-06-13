<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
version="1.0">
  <xsl:template match="xml/products">
    <xml>
      <products>
        <xsl:apply-templates select="product">
          <xsl:sort select="@sku" data-type="text" order="ascending"/>
        </xsl:apply-templates>
      </products>
    </xml>
  </xsl:template>
  <xsl:template match="product">
    <xsl:copy-of select="." />
  </xsl:template>
</xsl:stylesheet>

