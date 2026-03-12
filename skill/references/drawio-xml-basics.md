# draw.io XML Basics

draw.io diagrams are stored as XML containing an `mxGraphModel`. This reference will help you construct valid XML to generate diagrams.

## Basic Boilerplate

Always use this outer structure when creating a new `.drawio` file. Make sure all IDs are unique.

```xml
<mxfile version="24.4.0">
  <diagram id="diagram1" name="Page-1">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- Insert Nodes (Vertices) and Edges here -->
        
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Nodes (Vertices)

A node is an `<mxCell>` with `vertex="1"` and an `<mxGeometry>`.

**Example:**
```xml
<mxCell id="node_web" value="Web Server" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry" />
</mxCell>
```

### Common Styles for Nodes
- **Standard Rectangle:** `rounded=1;whiteSpace=wrap;html=1;`
- **Database (Cylinder):** `shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;`
- **Cloud (Network):** `ellipse;shape=cloud;whiteSpace=wrap;html=1;`
- **Actor (User):** `shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;`
- **Colors:** 
  - Blue: `fillColor=#dae8fc;strokeColor=#6c8ebf;`
  - Green: `fillColor=#d5e8d4;strokeColor=#82b366;`
  - Red: `fillColor=#f8cecc;strokeColor=#b85450;`
  - Yellow: `fillColor=#fff2cc;strokeColor=#d6b656;`
  - Orange: `fillColor=#ffe6cc;strokeColor=#d79b00;`

## Edges (Connections)

An edge is an `<mxCell>` with `edge="1"`, `source="id"`, and `target="id"`.

**Example:**
```xml
<mxCell id="edge_1" value="HTTP request" style="endArrow=classic;html=1;rounded=0;" edge="1" parent="1" source="node_web" target="node_db">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

### Common Styles for Edges
- **Solid Arrow:** `endArrow=classic;html=1;rounded=0;`
- **Dashed Arrow:** `endArrow=classic;html=1;dashed=1;`
- **Bidirectional:** `endArrow=classic;startArrow=classic;html=1;`
- **Orthogonal (Elbow) routing:** `edgeStyle=orthogonalEdgeStyle;`

## Layout Tips
- Start the first node at `x="100" y="100"`.
- Standard node width is `120`, height is `60`.
- Leave 40-80px gaps between nodes to leave space for edge labels.
- Calculate coordinates iteratively. To place a node to the right of the previous one: `x = prev_x + prev_width + gap`.
